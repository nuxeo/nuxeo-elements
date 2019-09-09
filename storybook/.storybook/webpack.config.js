const { resolve } = require('path');
module.exports = ({ config }) => {
  config.module.rules.push({
    test: /\.stories\.js?$/,
    loaders: [require.resolve('@storybook/addon-storysource/loader')],
    enforce: 'pre',
    include: resolve('../'),
  });
  return config;
};
