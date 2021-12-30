const webpack = require('webpack');
const portInfo = require('../config.json')['dev/vue'];

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
    overlay: false,
  },

  configureWebpack: (config) => {
    // If you set it to true, it will cause some libraries to escape the sandbox,
    // Webpack use `(function() { return this })()` get `global` variable.
    config.node = false;
    config.devtool = 'source-map';
    // config.optimization.minimize = true;
    config.output.libraryTarget = 'umd';
    config.output.globalObject = 'window';
    config.output.jsonpFunction = `sub-app-jsonp`;
    config.mode = process.env.TEST_ENV ? 'production' : 'development';
    config.module.rules.push({
      type: 'javascript/auto',
      test: /\.mjs$/,
      use: [],
    });
    // config.plugins = [...config.plugins, new webpack.BannerPlugin('garfish')];
  },
};
