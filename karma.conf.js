const path = require('path');

const coverage = process.argv.find((arg) => arg.includes('coverage'));

let customLaunchers = {
  ChromeHeadlessNoSandbox: {
    base: 'ChromeHeadless',
    flags: ['--disable-gpu', '--no-sandbox'],
  },
  FirefoxHeadless: {
    base: 'Firefox',
    flags: ['-headless'],
  },
};

const reporters = ['mocha', 'coverage-istanbul'];

if (process.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY) {
  customLaunchers = {
    sl_latest_chrome: {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'Windows 10',
      version: 'latest',
    },
    sl_latest_firefox: {
      base: 'SauceLabs',
      browserName: 'firefox',
      platform: 'Windows 10',
      version: 'latest',
    },
    sl_latest_edge: {
      base: 'SauceLabs',
      browserName: 'microsoftedge',
      platform: 'Windows 10',
      version: 'latest',
    },
    sl_latest_safari: {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'macOS 10.13',
      version: 'latest',
    },
  };

  reporters.push('saucelabs');
}

module.exports = (config) => {
  let TEST_FILES = ['core/test/*.test.js', 'ui/test/*.test.js', 'dataviz/test/*.test.js'];
  if (config.grep) {
    TEST_FILES = [{ pattern: config.grep }];
  } else if (config.package) {
    TEST_FILES = [{ pattern: `${config.package}/test/*.test.js` }];
  }

  const sauceLabs = {};
  if (config.record) {
    sauceLabs.recordVideo = true;
  } else if (config.sauceRunName) {
    sauceLabs.testName = config.sauceRunName;
  }

  config.set({
    sauceLabs,
    basePath: '',
    singleRun: true,
    browsers: config.browsers && config.browsers.length > 0 ? config.browsers : Object.keys(customLaunchers),
    browserNoActivityTimeout: 5 * 60 * 1000,
    customLaunchers,
    frameworks: ['mocha', 'sinon-chai', 'source-map-support', 'webpack'],
    middleware: ['static'],
    static: {
      path: path.join(process.cwd(), ''),
    },
    files: [
      {
        pattern: 'node_modules/@webcomponents/webcomponentsjs/webcomponents-bundle.js',
        watched: false,
      },
      ...TEST_FILES,
    ],
    preprocessors: {
      '*/test/*.test.js': ['webpack', 'sourcemap'],
    },
    reporters,
    port: 9876,
    colors: true,
    browserConsoleLogOptions: {
      level: 'error',
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
      } catch (_) {
        return error;
      }
    },

    coverageIstanbulReporter: {
      reports: ['html', 'lcovonly', 'text-summary'],
      dir: path.join(__dirname, 'coverage'),
      combineBrowserReports: true,
      skipFilesWithNoCoverage: true,
    },

    client: {
      mocha: {
        reporter: 'html',
        ui: 'tdd',
        timeout: 3000,
      },
      chai: {
        includeStack: true,
      },
    },

    webpack: {
      devtool: 'inline-cheap-module-source-map',
      mode: 'development',
      module: {
        rules: [
          {
            test: /\.js$/,
            loader: require.resolve('@open-wc/webpack-import-meta-loader'),
          },
          coverage && {
            test: /\.js$/,
            loader: 'istanbul-instrumenter-loader',
            enforce: 'post',
            exclude: /node_modules|\.(test)\.js$/,
            options: {
              esModules: true,
            },
          },
        ].filter((_) => !!_),
      },
    },

    webpackMiddleware: {
      stats: 'errors-only',
    },

    webpackServer: {
      noInfo: true,
    },
  });
};
