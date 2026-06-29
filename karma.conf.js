const path = require('path');
const http = require('http');
const https = require('https');

/*
 * Workaround for node-fetch v2 "Premature close" errors on Node >= 19 (CI runs Node 22).
 * Since Node 19 the global HTTP/HTTPS agents enable keep-alive by default, so the node-fetch
 * used by @open-wc/karma-esm to load `context.html` reuses a pooled socket that the peer has
 * already closed, which surfaces as `FetchError: ... Premature close`. Forcing keep-alive off
 * makes each request open a fresh socket. Remove once Karma/karma-esm is replaced by WTR.
 */
[http.globalAgent, https.globalAgent].forEach((agent) => {
  agent.keepAlive = false;
  agent.options.keepAlive = false;
});

const coverage = process.argv.find((arg) => arg.includes('coverage'));

const reporters = coverage ? ['mocha', 'coverage-istanbul'] : ['mocha'];

let customLaunchers = {
  ChromeHeadlessNoSandbox: {
    base: 'ChromeHeadless',
    flags: ['--disable-gpu', '--no-sandbox'],
  },
  /* Disabled Firefox since self-hosted runners do not have it pre-installed.
     Can be enabled once we shift to Github Runners */
  // FirefoxHeadless: {
  //   base: 'Firefox',
  //   flags: ['-headless'],
  // },
};

if (process.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY) {
  customLaunchers = {
    sl_latest_chrome: {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'Windows 10',
      version: 'latest',
    },
    sl_latest_edge: {
      base: 'SauceLabs',
      browserName: 'microsoftedge',
      platform: 'Windows 10',
      version: 'latest',
    },
    sl_latest_firefox: {
      base: 'SauceLabs',
      browserName: 'firefox',
      platform: 'Windows 10',
      version: '98.0',
      geckodriverVersion: '0.30.0',
    },
    sl_latest_safari: {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'macOS 11',
      version: 'latest',
    },
  };

  reporters.push('saucelabs');
}

module.exports = (config) => {
  const sauceLabs = {};
  if (config.record) {
    sauceLabs.recordVideo = true;
  } else if (config.sauceRunName) {
    sauceLabs.testName = config.sauceRunName;
  }

  config.set({
    sauceLabs,
    hostname: '127.0.0.1',
    basePath: '',
    singleRun: true,
    browsers: config.browsers && config.browsers.length > 0 ? config.browsers : Object.keys(customLaunchers),
    browserDisconnectTimeout: 10 * 1000,
    browserDisconnectTolerance: 1,
    browserNoActivityTimeout: 5 * 60 * 1000,
    captureTimeout: 120000,
    customLaunchers,
    middleware: ['static'],
    static: {
      path: path.join(process.cwd(), ''),
    },
    files: [
      {
        pattern: 'node_modules/@webcomponents/webcomponentsjs/webcomponents-bundle.js',
        watched: false,
      },
      {
        pattern: 'test/setup.js',
        type: 'module',
      },
      {
        pattern: `${config.package || 'core'}/test/*${config.grep || '*.test.js'}`,
        type: 'module',
      },
    ],
    plugins: [
      // load plugin
      require.resolve('@open-wc/karma-esm'),

      // fallback: resolve any karma- plugins
      'karma-*',
    ],
    frameworks: ['esm', 'mocha', 'source-map-support'],
    esm: {
      // prevent auto loading of polyfills
      compatibility: 'none',
      coverage,
      // Vendored interpreter fork (see AGENTS.md); omit from coverage metrics.
      ...(coverage ? { coverageExclude: ['**/ui/js-interpreter/**'] } : {}),
      // if you are using 'bare module imports' you will need this option
      nodeResolve: true,
      // needed for npm link or lerna support
      preserveSymlinks: true,
    },

    reporters,
    port: 9876,
    colors: true,
    browserConsoleLogOptions: {
      // Set KARMA_VERBOSE=1 to surface karma-esm "Error loading test file" lines that are
      // otherwise hidden — useful when diagnosing silently-skipped suites.
      level: process.env.KARMA_VERBOSE === '1' ? 'log' : 'error',
    },
    logLevel: config.LOG_WARN,
    /** Some errors come in JSON format with a message property. */
    formatError(error) {
      try {
        if (typeof error !== 'string') {
          return error;
        }
        const parsed = JSON.parse(error);
        if (typeof parsed !== 'object' || !parsed.message) {
          return error;
        }
        return parsed.message;
      } catch (_e) {
        return error;
      }
    },

    coverageIstanbulReporter: {
      reports: ['html', 'lcovonly', 'text-summary'],
      dir: path.join(__dirname, 'coverage', config.package),
      combineBrowserReports: true,
      // Keep 0%-hit files in reports so local HTML/LCOV align with SonarQube source scope.
      skipFilesWithNoCoverage: false,
    },

    client: {
      coveragePackage: config.package || 'core',
      mocha: {
        reporter: 'html',
        ui: 'tdd',
        timeout: 3000,
      },
    },
  });
};
