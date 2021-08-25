const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: {
    main: './src/index.ts',
  },
  mode: process.env.TEST_ENV ? 'production' : 'development',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '//localhost:2333/',
    globalObject: 'window',
    jsonpFunction: 'main-jsonp-function',
  },
  devtool: 'source-map',
  devServer: {
    port: '2333',
    clientLogLevel: 'warning',
    disableHostCheck: true,
    compress: true,
    open: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    historyApiFallback: true,
    overlay: { warnings: false, errors: true },
    proxy: {
      // '/img': 'http://localhost:9090',
      // '/static': 'http://localhost:3000',
    },
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.ts(x)?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
        },
      },
      {
        test: /\.(le|c)ss$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: true,
    }),
  ],
};
