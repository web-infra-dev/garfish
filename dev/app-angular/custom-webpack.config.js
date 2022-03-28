const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { getPublicPath, getPort } = require('../util');
const appName = 'dev/angular';



module.exports = {
  output: {
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].js',
    // 需要配置成 umd 规范
    libraryTarget: 'umd',
    // 修改不规范的代码格式，避免逃逸沙箱
    globalObject: 'window',
    // webpack5 此参数不是必须，webpack5 将会直接使用 package.json name 作为唯一值，请确保应用间的 name 各不相同
    // 若为 webpack4，此处应将 chunkLoadingGlobal 改为 jsonpFunction, 并确保每个子应用该值都不相同，否则可能出现 webpack chunk 互相影响的可能
    chunkLoadingGlobal: 'Garfish-demo-angular',
    // 保证子应用的资源路径变为绝对路径，避免子应用的相对资源在变为主应用上的相对资源，因为子应用和主应用在同一个文档流，相对路径是相对于主应用而言的
    publicPath: getPublicPath(appName)
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(__dirname, 'src/index.html'),
      chunksSortMode: 'manual',
      chunks: ['styles', 'runtime', 'polyfills', 'scripts', 'vendors', 'main'],
      scriptLoading: 'defer',
    }),
  ],
  devServer: {
    allowedHosts: 'all',
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
};
