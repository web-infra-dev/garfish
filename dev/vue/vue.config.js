// const SlardarWebpackPlugin = require('@slardar/webpack-plugin');
// const GarfishPlugin = require('../../packages/tool/webpack-plugin');s
const webpack = require('webpack');

module.exports = {
  devServer: {
    open: false,
    port: '2666',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
    },
    historyApiFallback: true,
    overlay: {
      warnings: false,
      errors: false,
    },
  },

  publicPath: 'http://localhost:2666',
  configureWebpack: (config) => {
    // config.output.library = `sub-app-garfish-exports`;
    config.output.jsonpFunction = `sub-app-jsonp`;
    config.output.libraryTarget = 'umd';
    config.output.globalObject = 'window';
    config.devtool = 'source-map';
    config.mode = process.env.TEST_ENV ? 'production' : 'development';
    config.optimization.minimize = true;
    config.module.rules.push({
      type: 'javascript/auto',
      test: /\.mjs$/,
      use: [],
    });
    config.plugins = [
      ...config.plugins,
      new webpack.BannerPlugin('garfish'),
      // new GarfishPlugin({
      //   webpackInstance: webpack,
      //   appId: 'vue_app',
      // }),
    ];
  },
};
