const { resolve } = require('path');
module.exports = ({ config }) => {
  config.module.rules.push(
    // fix import.meta
    {
      test: /\.js$/,
      loader: require.resolve('@open-wc/webpack-import-meta-loader/webpack-import-meta-loader.js'),
    },
    {
      test: /\.stories\.js?$/,
      loaders: [require.resolve('@storybook/addon-storysource/loader')],
      enforce: 'pre',
      include: resolve('../'),
    },
    {
      test: /layout.html$/,
      use: 'raw-loader',
    },
    // expose Quill
    {
      test: require.resolve('@nuxeo/quill/dist/quill.js'),
      use: [
        {
          loader: 'expose-loader',
          options: 'Quill',
        },
      ],
    },
    // Babel loader for react-draggable and other modern JS in node_modules
    {
      test: /\.js$/,
      include: [
        resolve(__dirname, '../../node_modules/react-draggable'),
      ],
      use: {
        loader: require.resolve('babel-loader'),
        options: {
          presets: [require.resolve('@babel/preset-env')],
        },
      },
    },
  );
  return config;
};
