const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const portInfo = require('../config.json')['cypress/project/main'];

module.exports = {
  devtool: 'source-map',

  mode: process.env.TEST_ENV ? 'production' : 'development',

  entry: {
    main: './src/index.ts',
  },

  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '//localhost:2333/',
    globalObject: 'window',
    jsonpFunction: 'main-jsonp-function',
  },

  devServer: {
    open: true,
    port: portInfo.port,
    compress: true,
    disableHostCheck: true,
    historyApiFallback: true,
    clientLogLevel: 'warning',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    overlay: {
      errors: true,
      warnings: false,
    },
  },

  resolve: {
    extensions: ['.js', '.mjs', '.jsx', '.ts', '.tsx'],
  },

  module: {
    rules: [
      {
        test: /\.ts(x)?$/,
        exclude: /node_modules/,
        use: { loader: 'ts-loader' },
      },
      {
        type: 'javascript/auto',
        test: /\.mjs$/,
        use: [],
      },
      {
        test: /\.(le|c)ss$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: './index.html',
    }),
  ],
};
