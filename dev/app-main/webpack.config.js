import path from 'path';
import { DefinePlugin } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import portMap from '../config.json';

const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const appName = 'dev/main';
const port = portMap[appName].port;
const publicPath = portMap[appName].publicPath;

const isInWebIDE = () => {
  return Boolean(process.env.IDE_PLATFORM);
};
const getProxyHost = (port) => {
  return `${port}-${process.env.WEBIDE_PODID || ''}.webide-boe.byted.org`;
};
const isDevelopment = process.env.NODE_ENV !== 'production';

const webpackConfig = {
  mode: isDevelopment ? 'development' : 'production',
  devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false,
  entry: {
    main: './src/index.tsx',
  },
  output: {
    // 开发环境设置 true 将会导致热更新失效
    clean: isDevelopment ? false : true,
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].js',
    path: path.join(__dirname, 'dist'),
    // prettier-ignore
    publicPath: !isDevelopment
      ? publicPath
      : isInWebIDE()
        ? `//${getProxyHost(port)}/`
        : `http://localhost:${port}/`,
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [
            '@babel/preset-typescript',
            '@babel/preset-react',
            '@babel/preset-env',
          ],
        },
      },
      {
        test: /\.css$|\.less$/,
        use: [
          {
            loader: 'style-loader', // creates style nodes from JS strings
          },
          {
            loader: 'css-loader', // translates CSS into CommonJS
          },
          {
            loader: 'less-loader',
            options: { javascriptEnabled: true },
            // path.resolve(__dirname, './src/less/variable.less')
          },
        ],
      },
      {
        test: /\.(png|jpg|gif|svg|ico)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]',
        },
      },
      {
        test: /\.woff|woff2|eot|ttf$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 100000,
            },
          },
        ],
      },
    ],
  },
  devServer: {
    hot: true,
    // open: true,
    historyApiFallback: true,
    port: 8090,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    allowedHosts: 'all',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      favicon: path.resolve(__dirname, './src/static/favicon.ico'),
    }),
    new DefinePlugin({
      'process.env.inIDE': isInWebIDE(),
      'process.env.WEBIDE_PODID': JSON.stringify(process.env.WEBIDE_PODID),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    // 微前端场景下子应用热更新需要关闭 react-fast-refresh, 否则子应用热更新不会生效
    // isDevelopment && new ReactRefreshWebpackPlugin()
  ],
};

export default webpackConfig;
