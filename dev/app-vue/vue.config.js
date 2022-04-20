const { getPublicPath, getPort } = require('../util');
const appName = 'dev/vue-sub';

module.exports = {
  chainWebpack: (config) => {
    config.optimization.delete('splitChunks');
    config.module
      .rule('images')
      .use('url-loader')
      .loader('url-loader')
      .tap((options) => Object.assign(options, { limit: 1024 }));
  },
  configureWebpack: () => {
    return {
      entry: './src/main.js',
      output: {
        filename: '[name].[hash].js',
        chunkFilename: '[name].[hash].js',
        libraryTarget: 'umd',
        globalObject: 'window',
      },
    };
  },
  publicPath: getPublicPath(appName),
     
  devServer: {
    inline: true,
    hot: true,
    host: '0.0.0.0',
    port: getPort(appName),
    historyApiFallback: true,
    disableHostCheck: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
};
