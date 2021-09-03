const webpack = require('webpack');

module.exports = {
  publicPath: 'http://localhost:2666',

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

  configureWebpack: (config) => {
    config.optimization.minimize = true;
    config.devtool = 'source-map';
    config.output.libraryTarget = 'umd';
    config.output.globalObject = 'window';
    config.output.jsonpFunction = `sub-app-jsonp`;
    config.mode = process.env.TEST_ENV ? 'production' : 'development';

    config.plugins = [...config.plugins, new webpack.BannerPlugin('garfish')];
  },
};
