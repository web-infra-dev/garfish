import HtmlWebpackPlugin from 'html-webpack-plugin';
import portMap from '../config.json';
import { DefinePlugin } from 'webpack';
const appName = 'dev/react16';
const port = portMap[appName].port;
const publicPath = portMap[appName].publicPath;

const isInWebIDE = () => {
  return Boolean(process.env.IDE_PLATFORM);
};
const getProxyHost = (port) => {
  return `${port}-${process.env.WEBIDE_PODID || ''}.webide-boe.byted.org`;
};

const webpackConfig = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false,
  entry: {
    main: './src/index.tsx',
  },
  output: {
    // 开发环境设置 true 将会导致热更新失效
    clean: process.env.NODE_ENV === 'production' ? true : false,
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].js',
    // 需要配置成 umd 规范
    libraryTarget: 'umd',
    // 修改不规范的代码格式，避免逃逸沙箱
    globalObject: 'window',
    // webpack5 此参数不是必须，webpack5 将会直接使用 package.json name 作为唯一值，请确保应用间的 name 各不相同
    // 若为 webpack4，此处应将 chunkLoadingGlobal 改为 jsonpFunction, 并确保每个子应用该值都不相同，否则可能出现 webpack chunk 互相影响的可能
    chunkLoadingGlobal: 'Garfish-demo-react16',
    // 保证子应用的资源路径变为绝对路径，避免子应用的相对资源在变为主应用上的相对资源，因为子应用和主应用在同一个文档流，相对路径是相对于主应用而言的
    publicPath:
      process.env.NODE_ENV === 'production'
        ? publicPath
        : isInWebIDE()
        ? `//${getProxyHost(port)}/`
        : `http://localhost:${port}/`,
  },
  // externals: {
  //   react: 'react',
  //   "react-dom": "react-dom",
  //   "react-router-dom": "react-router-dom",
  //   "mobx-react": "mobx-react"
  // },
  // 避免 global 逃逸
  node: false,
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json'],
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
          },
        ],
      },
      {
        test: /\.(svg|png|jpg|gif|svg)$/,
        loader: 'url-loader',
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
    port,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    allowedHosts: 'all',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
  ],
};

export default webpackConfig;
