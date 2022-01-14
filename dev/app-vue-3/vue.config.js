const portMap = require('../config.json');
const appName = 'dev/vue3';
const port = portMap[appName].port;
const publicPath = portMap[appName].publicPath;

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
  publicPath:
    process.env.NODE_ENV === 'production'
      ? publicPath
      : `http://localhost:${port}/`,
  devServer: {
    inline: true,
    hot: true,
    host: '0.0.0.0',
    port,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
};
