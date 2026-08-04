/**
 * Web Test Runner configuration for nuxeo-elements unit tests (@web/test-runner + Mocha TDD).
 *
 * nuxeo-elements is an npm-workspaces monorepo. The three source packages (core, ui, dataviz)
 * are tested separately — exactly as the former karma `--package` runs did. The package under
 * test is selected via the NX_PACKAGE env var (see the test:<package> npm scripts).
 *
 * Important design choices (carried over from karma-esm):
 *
 * 1) Single test entry per package (`<package>/test/load-all-tests.js` only in `files`)
 *    Web Test Runner reports "1 test file" because it counts runner entry points, not Mocha suites.
 *    That file imports the shared test/setup.js then every *.test.js for the package in one static
 *    graph so Mocha registers all suites before the run completes. Do not glob all test files here —
 *    parallel loading can race and skip suites (the original Karma failure mode).
 *
 * 2) Coverage mode (`web-test-runner --coverage`, used by npm test)
 *    Uses Istanbul source instrumentation via rollup-plugin-istanbul (adapted with
 *    @web/dev-server-rollup's fromRollup()). This gives Karma-equivalent function-body coverage
 *    for Polymer's factory pattern. Native V8 instrumentation is disabled
 *    (`nativeInstrumentation: false`). Output goes to coverage/<package>/lcov.info. After the run,
 *    `scripts/test/unit/inject-zero-coverage.js` adds 0% lcov records for manifest paths not loaded
 *    by any test (mirrors Karma skipFilesWithNoCoverage:false).
 *
 * Related: scripts/test/unit/generate-test-load-all.js, scripts/test/unit/generate-coverage-imports.js,
 * scripts/test/unit/inject-zero-coverage.js, test/setup.js.
 */
import { createRequire } from 'node:module';
import { chromeLauncher } from '@web/test-runner-chrome';
import { defaultReporter } from '@web/test-runner';
import { fromRollup } from '@web/dev-server-rollup';
import { nuxeoTestFallbackPlugin } from './scripts/test/unit/web-test-runner-fallback-plugin.mjs';

const require = createRequire(import.meta.url);
// Bundled Chromium matches puppeteer-core; system Chrome on CI runners often mismatches.
const puppeteer = require('puppeteer');

// Istanbul instrumentation via rollup-plugin-istanbul — gives Karma-equivalent function body coverage.
const rollupIstanbul = require('rollup-plugin-istanbul');
const istanbulPlugin = fromRollup(rollupIstanbul);

const VALID_PACKAGES = ['core', 'ui', 'dataviz'];
const pkg = process.env.NX_PACKAGE || 'core';
if (!VALID_PACKAGES.includes(pkg)) {
  throw new Error(`Invalid NX_PACKAGE "${pkg}". Expected one of: ${VALID_PACKAGES.join(', ')}`);
}

const chromeArgs = ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage', '--disable-setuid-sandbox'];

// Allow overriding the tests-finish timeout via env, but fall back to the default when the value is
// missing or non-numeric (e.g. "10m") so a bad override can't silently disable the timeout (NaN).
const DEFAULT_FINISH_TIMEOUT = 900000;
const parsedFinishTimeout = Number(process.env.NX_FINISH_TIMEOUT);
const finishTimeout =
  Number.isFinite(parsedFinishTimeout) && parsedFinishTimeout > 0 ? parsedFinishTimeout : DEFAULT_FINISH_TIMEOUT;

const verbose = process.env.WTR_VERBOSE === '1';
const coverageEnabled = process.argv.includes('--coverage');

// A focused run (`web-test-runner --files ...` / `--group ...`) is treated as a debugging session:
// stray uncaught-promise errors ARE shown so the developer can trace them to the file under test.
// The default aggregate run (the generated load-all-tests.js barrel) instead suppresses that noise —
// at the all-suites level the errors can't be attributed to any single suite, they fire after the
// triggering test already passed, and the run itself is green. `WTR_VERBOSE=1` also re-enables them.
const singleFileRun = process.argv.includes('--files') || process.argv.includes('--group');
const suppressStrayUncaught = !verbose && !singleFileRun;

// Set when a "thrown in a Promise outside a test" banner is seen, so the immediately-following error
// log (the wrapped error) is dropped too. Safe because @web/browser-logs emits the two back-to-back
// and the runner uses concurrency: 1.
let suppressNextStrayUncaught = false;

// Hang diagnostics. test/setup.js pushes a breadcrumb to /__nx-breadcrumb at each test boundary:
// `t=<label>&seq=<n>` when a test starts, `done=1&seq=<n>` when it finishes. These fire-and-forget
// requests can arrive out of order, so a monotonic per-test sequence number is used instead of raw
// arrival order: the started test with the highest seq that has no matching (or later) `done` is the
// one that never finished — the hang culprit. Browser console logs cannot be used here: Web Test
// Runner buffers them and only flushes on session finish, which never happens during a hang. The
// dev-server endpoint records each breadcrumb the moment the browser process sends it, even when the
// page's JS thread is blocked in a synchronous loop.
let latestStartedSeq = -1;
let latestStartedLabel = null;
let maxFinishedSeq = -1;

// Set true only when Web Test Runner reports that a session hit testsStartTimeout / testsFinishTimeout
// (the error surfaces on session.errors in the reporter hooks below, for both synchronous-loop and
// never-resolving-await hangs). Gating the exit report on this avoids a false positive when the very
// last test's fire-and-forget `done` beacon is lost as the browser page is torn down on a clean run.
let timedOut = false;

const sessionsTimedOut = (sessions) =>
  (sessions || []).some((session) =>
    (session.errors || []).some((error) => /did not finish within|did not start after/.test((error && error.message) || '')),
  );

// Dev-server endpoint that receives the hang-diagnostics breadcrumbs (see test/setup.js).
const breadcrumbPlugin = {
  name: 'nuxeo-hang-breadcrumb',
  serve(context) {
    if (context.path !== '/__nx-breadcrumb') {
      return undefined;
    }
    const seq = Number(context.query && context.query.seq);
    if (Number.isFinite(seq)) {
      if (context.query.done != null) {
        maxFinishedSeq = Math.max(maxFinishedSeq, seq);
      } else if (typeof context.query.t === 'string' && seq > latestStartedSeq) {
        latestStartedSeq = seq;
        latestStartedLabel = context.query.t;
      }
    }
    return { body: '', type: 'js' };
  },
};

// Backstop hang reporter. Runs on process exit (after all Web Test Runner output) so the hint is the
// last thing shown. Reports only on an actual timeout and when a test started but never finished (its
// seq is higher than the highest finished seq), so clean runs print nothing.
process.on('exit', () => {
  if (timedOut && latestStartedLabel != null && latestStartedSeq > maxFinishedSeq) {
    console.error(
      `\n[hang-watchdog] The run timed out. The last test that STARTED but never completed was:\n` +
        `    ${latestStartedLabel}\n` +
        `This is the most likely cause of the hang/timeout — fix or quarantine that test file, then re-run.\n`,
    );
  }
});

/**
 * Wraps the default WTR reporter to suppress the built-in "Code coverage: X %" line.
 * Our inject-zero-coverage.js post-run script prints the authoritative number instead.
 */
function noCoverageSummaryReporter() {
  const inner = defaultReporter();
  return {
    ...inner,
    reportTestFileResults(args) {
      // In the default aggregate run, suppress WTR's "🚧 404 network requests" list. Every 404 in this
      // suite is an intentional negative-path test (missing layouts, importHref / nuxeo-error /
      // image-viewer / audio failure cases). Restored for focused/verbose runs so genuinely unexpected
      // 404s stay visible.
      if (suppressStrayUncaught && Array.isArray(args.sessionsForTestFile)) {
        const saved = args.sessionsForTestFile.map((session) => session.request404s);
        args.sessionsForTestFile.forEach((session) => {
          session.request404s = [];
        });
        try {
          return inner.reportTestFileResults(args);
        } finally {
          args.sessionsForTestFile.forEach((session, i) => {
            session.request404s = saved[i];
          });
        }
      }
      return inner.reportTestFileResults(args);
    },
    getTestProgress(args) {
      const lines = inner.getTestProgress(args);
      return lines.filter((line) => !/Code coverage:|coverage report at/.test(line));
    },
    onTestRunFinished(args) {
      if (sessionsTimedOut(args && args.sessions)) {
        timedOut = true;
      }
      if (typeof inner.onTestRunFinished === 'function') {
        return inner.onTestRunFinished(args);
      }
      return undefined;
    },
    stop(args) {
      if (sessionsTimedOut(args && args.sessions)) {
        timedOut = true;
      }
      if (typeof inner.stop === 'function') {
        return inner.stop(args);
      }
      return undefined;
    },
  };
}

/** App sources for the package under test (mirrors former karma coverage scope). */
const appSources = [`${pkg}/**/*.js`];

// Files excluded from coverage instrumentation (mirrors sonar.coverage.exclusions +
// generate-coverage-imports.js excludes). These are vendored / barrel / non-instrumentable paths.
const coverageExclude = [
  'test/**',
  '**/test/**',
  '**/*.test.js',
  '**/node_modules/**',
  // Dev server serves Polymer .html imports as *.html.js; those paths do not exist on disk.
  '**/*.html.js',
  // Package barrels (re-export only).
  'core/nuxeo-elements.js',
  'ui/nuxeo-ui-elements.js',
  'dataviz/nuxeo-dataviz-elements.js',
  // Vendored / polyfill code.
  'ui/js-interpreter/**',
  'ui/viewers/pdfjs/**',
  'ui/import-href.js',
  'storybook/**',
  'testing-helpers/**',
];

export default {
  files: [`${pkg}/test/load-all-tests.js`],
  rootDir: process.cwd(),
  plugins: [
    nuxeoTestFallbackPlugin(),
    breadcrumbPlugin,
    // Istanbul instrumentation (only when --coverage) — instruments app source files so function
    // bodies get accurate hit/miss counting (unlike V8 which inflates coverage for Polymer declarations).
    ...(coverageEnabled
      ? [
          istanbulPlugin({
            include: appSources,
            exclude: coverageExclude,
          }),
        ]
      : []),
  ],
  reporters: [noCoverageSummaryReporter()],
  nodeResolve: {
    exportConditions: ['browser', 'development', 'import', 'module', 'default'],
  },
  // Needed for npm workspaces: @nuxeo/* packages are symlinked into node_modules.
  preserveSymlinks: true,
  concurrency: 1,
  concurrentBrowsers: 1,
  hostname: '127.0.0.1',
  testsStartTimeout: 180000,
  testsFinishTimeout: finishTimeout,
  // Single entry imports every suite module; dev-server transform + first page load can exceed 30s in CI.
  browserStartTimeout: 120000,
  coverage: coverageEnabled,
  coverageConfig: coverageEnabled
    ? {
        report: true,
        reportDir: `coverage/${pkg}`,
        reporters: ['html', 'lcov'],
        nativeInstrumentation: false, // Use Istanbul instrumentation (via rollup-plugin-istanbul) instead of V8
        include: appSources,
        exclude: coverageExclude,
      }
    : undefined,
  // Default framework path is autorun.js (imports the test module and calls mocha.run).
  testFramework: {
    config: {
      ui: 'tdd',
      timeout: 3000,
    },
  },
  browsers: [
    chromeLauncher({
      puppeteer,
      launchOptions: {
        args: chromeArgs,
      },
    }),
  ],
  // Always collect browser logs; filterBrowserLogs decides what reaches CI output (see test/setup.js).
  browserLogs: true,
  filterBrowserLogs: (log) => {
    if (verbose) {
      return true;
    }
    // Stringify so we can match against object args (e.g. `{ message: 'No message', status: 404 }`)
    // that `String(obj)` would otherwise turn into `[object Object]`.
    const text = (log.args || [])
      .map((arg) => {
        if (arg == null) return String(arg);
        if (typeof arg === 'string') return arg;
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      })
      .join(' ');
    // @web/browser-logs logs every uncaught promise rejection as a generic
    // "An error was thrown in a Promise outside a test" banner followed by the error itself. In the
    // aggregate barrel run these are stray async rejections from negative-path tests (mock rejectWith,
    // late 404s, detached-dialog cleanup) that fire after the triggering test already passed and that
    // cannot be attributed to a single suite. Drop the banner and the one error line it wraps. Genuine
    // failures surface as Mocha test failures, never via this banner, so nothing real is hidden.
    if (suppressStrayUncaught) {
      if (/thrown in a Promise outside a test/.test(text)) {
        suppressNextStrayUncaught = true;
        return false;
      }
      if (suppressNextStrayUncaught) {
        suppressNextStrayUncaught = false;
        return false;
      }
    }
    // Benign stray-async noise logged by test/setup.js after a test boundary.
    if (/\[test-setup\] ignoring stray/.test(text)) {
      return false;
    }
    // Benign nuxeo-client 404 / 500 / abort noise from async work that resolves after a test ends.
    if (/Invalid json|No message|Not Found/.test(text) && /\b404\b/.test(text)) {
      return false;
    }
    // Object dumps like `{ status: 404 }` / `{ message: 'No message', status: 404 }` from failure handlers.
    if (/^\{[^{}]*"status":\s*\d{3}[^{}]*\}\s*$/.test(text.trim())) {
      return false;
    }
    // Bare `Error: Not Found` stacks from the nuxeo client's internal `_callFetch`.
    if (/Error: Not Found/.test(text) && /node_modules\/nuxeo\/nuxeo\.js/.test(text)) {
      return false;
    }
    if (/AbortError\b|: Aborted\b/.test(text)) {
      return false;
    }
    if (/ResizeObserver loop completed with undelivered notifications/.test(text)) {
      return false;
    }
    return log.type === 'error';
  },
};
