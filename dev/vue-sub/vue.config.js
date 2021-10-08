const webpack = require('webpack');
const portInfo = require('../config.json')['cypress/project/vue-sub'];

module.exports = {
  publicPath: `http://localhost:${portInfo.port}`,

  devServer: {
    open: false,
    port: portInfo.port,
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
