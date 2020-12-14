/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
const { createSauceLabsLauncher } = require('@web/test-runner-saucelabs');
const { legacyPlugin } = require('@web/dev-server-legacy');
const { playwrightLauncher } = require('@web/test-runner-playwright');

const baseConfig = {
  files: '{core, dataviz, ui}/test/**/*.test.js',
  groups: [
    {
      name: 'core',
      files: 'core/test/**/*.test.js',
    },
    {
      name: 'dataviz',
      files: 'dataviz/test/**/*.test.js',
    },
    {
      name: 'ui',
      files: 'ui/test/**/*.test.js',
    },
  ],
  browsers: [
    playwrightLauncher({ product: 'chromium' }),
    playwrightLauncher({ product: 'webkit' }),
    playwrightLauncher({ product: 'firefox' }),
  ],
  coverage: true,
  nodeResolve: true,
  testFramework: {
    config: {
      ui: 'tdd',
    },
  },
};

const isSauceLabsRun = process.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY;
if (isSauceLabsRun) {
  const sharedCapabilities = {
    'sauce:options': {
      name: 'Nuxeo Cold Storage',
      build: `Nuxeo Cold Storage ${process.env.BRANCH_NAME || 'local'} build ${process.env.BUILD_NUMBER || ''}`,
    },
  };

  const sauceLabsLauncher = createSauceLabsLauncher({
    user: process.env.SAUCE_USERNAME,
    key: process.env.SAUCE_ACCESS_KEY,
  });

  const sauceBrowsers = [
    sauceLabsLauncher({
      ...sharedCapabilities,
      browserName: 'chrome',
      browserVersion: 'latest',
      platformName: 'Windows 10',
    }),
    sauceLabsLauncher({
      ...sharedCapabilities,
      browserName: 'firefox',
      browserVersion: 'latest',
      platformName: 'Windows 10',
    }),
    sauceLabsLauncher({
      ...sharedCapabilities,
      browserName: 'safari',
      browserVersion: 'latest',
      platformName: 'macOS 10.15',
    }),
    sauceLabsLauncher({
      ...sharedCapabilities,
      browserName: 'MicrosoftEdge',
      browserVersion: 'latest',
      platformName: 'Windows 10',
    }),
  ];
  baseConfig.browsers = baseConfig.browsers.concat(sauceBrowsers);
  baseConfig.browserStartTimeout = 1000 * 30 * 5;
  baseConfig.sessionStartTimeout = 1000 * 30 * 5;
  baseConfig.sessionFinishTimeout = 1000 * 30 * 5;
  baseConfig.plugins = [legacyPlugin()];
  baseConfig.testFramework.config.timeout = '10000';
}

module.exports = baseConfig;
