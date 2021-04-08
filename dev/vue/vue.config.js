// const SlardarWebpackPlugin = require('@slardar/webpack-plugin');
// const GarfishPlugin = require('../../packages/tool/webpack-plugin');
const webpack = require('webpack');

module.exports = {
  devServer: {
    open: false,
    port: '9090',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
    },
  },

  publicPath: 'http://localhost:9090',
  configureWebpack: (config) => {
    // config.output.libraryTarget = 'commonjs';
    config.output.globalObject = 'window';
    config.devtool = 'source-map';
    config.mode = 'production';

    config.plugins = [
      ...config.plugins,
      // new GarfishPlugin({
      //   webpackInstance: webpack,
      //   appId: 'vue_app',
      // }),
    ];
  },
};
