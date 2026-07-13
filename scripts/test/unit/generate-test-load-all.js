#!/usr/bin/env node
/**
 * Build script: writes one `<package>/test/load-all-tests.js` barrel per source package
 * (core, ui, dataviz). These files are gitignored — regenerate when you add/remove test files.
 *
 * Web Test Runner uses the per-package barrel as the only test entry for that package
 * (web-test-runner.config.mjs selects it via the NX_PACKAGE env var). The barrel statically
 * imports the shared `test/setup.js` then every `*.test.js` under that package's `test/`
 * folder. That gives one module graph so Mocha registers all suites before the run completes.
 * Loading many test entry patterns in parallel can race and skip suites (the original Karma
 * failure mode), so we keep a single static entry per package.
 *
 * Run: `npm run update-test-load-all` (also runs at the start of `npm test`).
 *
 * After adding a new `something.test.js`, run this script (or `npm test`) so the import appears here.
 */
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const root = path.join(__dirname, '../../..');

// Source packages tested separately (mirrors the former karma `--package` runs).
const PACKAGES = ['core', 'ui', 'dataviz'];

const banner = (pkg) => `/**
 * AUTO-GENERATED — do not edit. Regenerate: npm run update-test-load-all (runs in npm test).
 *
 * Sole Web Test Runner entry for the "${pkg}" package (selected via NX_PACKAGE in
 * web-test-runner.config.mjs). Web Test Runner progress shows "1/1 test files"; pass/fail
 * lines are individual Mocha tests. This module imports the shared setup.js then every
 * suite *.test.js — see scripts/test/unit/generate-test-load-all.js.
 *
 * Test files are imported sequentially (never in parallel) via top-level await, so Mocha registers
 * every suite in a stable order before the run starts — Web Test Runner's mocha autorun awaits this
 * module before calling mocha.run(). Each import is wrapped in try/catch: a single file that fails to
 * import (syntax / bad import) is logged with its path via [test-load] so it no longer takes down the
 * whole package suite — the remaining files still load and run. To keep this safe for CI, any import
 * failure is also re-surfaced as a failing Mocha test (see below), so a broken/missing suite makes the
 * run exit non-zero instead of passing green while silently skipped. Before each import the file path
 * is published on globalThis.__NX_CURRENT_TEST_FILE__ so test/setup.js can attribute each suite (and
 * any hang) to it.
 */

import '../../test/setup.js';
`;

const loader = (imports) => `const testFiles = [
${imports.map((p) => `  './${p}',`).join('\n')}
];

const failedImports = [];

/* eslint-disable no-await-in-loop */
for (const testFile of testFiles) {
  globalThis.__NX_CURRENT_TEST_FILE__ = testFile;
  try {
    await import(testFile);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(\`[test-load] FAILED to import \${testFile}:\`, (error && error.stack) || error);
    failedImports.push({ testFile, error });
  }
}
globalThis.__NX_CURRENT_TEST_FILE__ = undefined;
/* eslint-enable no-await-in-loop */

// A swallowed import failure must not let the run pass silently: re-surface each one as a failing
// Mocha test so Web Test Runner exits non-zero and the missing/invalid suite is reported instead of
// skipped (its coverage is still lost, but the failure is now impossible to overlook in CI).
if (failedImports.length > 0) {
  suite('load-all-tests: failed suite imports', () => {
    failedImports.forEach(({ testFile, error }) => {
      test(\`imports \${testFile}\`, () => {
        throw error instanceof Error ? error : new Error(\`Failed to import \${testFile}: \${error}\`);
      });
    });
  });
}
`;

let total = 0;
for (const pkg of PACKAGES) {
  const testDir = path.join(root, pkg, 'test');
  if (!fs.existsSync(testDir)) {
    console.warn('generate-test-load-all: skipping missing test dir %s/test', pkg);
    continue;
  }

  const seen = new Set();
  for (const file of glob.sync('**/*.test.js', { cwd: testDir, nodir: true })) {
    seen.add(file.replace(/\\/g, '/'));
  }

  const lines = Array.from(seen).sort();

  const outFile = path.join(testDir, 'load-all-tests.js');
  fs.writeFileSync(outFile, `${banner(pkg)}${loader(lines)}`, 'utf8');
  total += lines.length;

  console.log('generate-test-load-all: %d suite imports → %s/test/load-all-tests.js', lines.length, pkg);
}

if (total === 0) {
  console.error('generate-test-load-all: matched 0 test files across', PACKAGES.join(', '));
  process.exit(1);
}
