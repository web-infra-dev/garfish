const webpack = require('webpack');

module.exports = {
  publicPath: 'http://localhost:2555',

  devServer: {
    open: false,
    port: '2555',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
    },
    historyApiFallback: true,
  },

  configureWebpack: (config) => {
    config.optimization.minimize = true;
    config.devtool = 'source-map';
    config.output.libraryTarget = 'umd';
    config.output.globalObject = 'window';
    config.output.jsonpFunction = `vue-app-jsonp`;
    config.mode = process.env.TEST_ENV ? 'production' : 'development';
    config.optimization.minimize = true;
    config.module.rules.push({
      type: 'javascript/auto',
      test: /\.mjs$/,
      use: [],
    });
    config.plugins = [...config.plugins, new webpack.BannerPlugin('garfish')];
  },
};
