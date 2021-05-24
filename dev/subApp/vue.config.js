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
    config.output.library = `vue-garfish-exports`;
    config.output.jsonpFunction = `vue-jsonp`;
    config.output.libraryTarget = 'umd';
    config.output.globalObject = 'window';
    config.devtool = 'source-map';
    config.mode = 'production';

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
