---
title: 热更新问题
slug: /blog/hmr
order: 2
---

> 1. 微前端是为了解决将复杂的单体应用以功能或业务需求垂直的切分成更小的子系统而设计的一套解决方案，主应用和子应用可独立开发、独立部署。微前端模式下主、子应用都是独立的应用，微前端作为运行在主、子应用之下的框架层，不会干涉主、子 应用在 dev 模式下的热更新能力。
> 2. 在微前端场景下，主、子应用的热更新能力需要构建工具层提供相应的配置（例如 webpack）, garfish 不默认提供热更新的能力。
> 3. 但是在微前端场景下，由于应用场景的特殊性，我们也会针对各种场景下的热更新情况作出相应的说明与配置示例，期望能给业务方提供相应的参考。

## 什么是模块热更新？

模块热更新也叫 HMR，全称是 Hot Module Replacement，指当你在更改并保存代码时，构建工具将会重新进行编译打包，并将新的包模块发送至浏览器端，浏览器用新的包模块替换旧的，从而可以在不刷新浏览器的前提下达到修改的功能。

## 模块热更新常用方案

### 配置 webpack 的 hot.module 回调

```js
// webpack.config.js
module.exports = {
  devServer: {
    hot: true,
  },
}

// index.tsx
import ReactDOM from 'react-dom';
import App from './components/App';

// 设置 hot.module 回调开启热更新：
if ((module as any).hot) {
  (module as any).hot.accept(['./components/App'], () => {
    ReactDOM.render(<App />, document.getElementById('root'));
  });
}
```

### react-fast-refresh 插件

> React 官方提供，相比于 react-hot-loader，容错能力更高。

```js
// webpack.config.js
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const isDevelopment = process.env.NODE_ENV !== 'production';
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './index.js',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/env', '@babel/preset-react'],
          plugins: [require.resolve('react-refresh/babel')], // 为 react-refresh 添加
        },
      },
    ],
  },
  plugins: [
    isDevelopment && new ReactRefreshPlugin(), // 为 react-refresh 添加
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
  ],
};
```

### react-hot-loader 插件

1. react-hot-loader 对代码侵入性较大，需要使用 `hot` 包裹入口组件。
2. 其次，如果使用 ts-loader（没有使用 babel-loader） 去编译 ts 文件的话，使用 react-hot-loader 会不成功，因为 react-hot-loader 依赖于 babel-loader，所以对于使用 ts-loader 的项目来说不太友好。

> React-Hot-Loader is expected to be replaced by React Fast Refresh. Please remove React-Hot-Loader if Fast Refresh is currently supported on your environment -- 官网

```js
// webpack.config.js
module.exports = {
// 1. 在入口添加 react-hot-loader/patch, 保证 react-hot-loader 在 react 和 react-dom 之前加载
  entry: ['react-hot-loader/patch', './src'],
  ...
  // 2. 设置 ts/tsx 的编译方式，使用 babel-loader 时在 options 中添加 plugins
   {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
            babelrc: false,
            presets: [
              [
                "@babel/preset-env",
              ],
              "@babel/preset-typescript",
              "@babel/preset-react",
            ],
            plugins: [
              // plugin-proposal-decorators is only needed if you're using experimental decorators in TypeScript
              ["@babel/plugin-proposal-decorators", { legacy: true }],
              ["@babel/plugin-proposal-class-properties", { loose: true }],
              "react-hot-loader/babel", // 添加 react-hot-loader 插件
            ],
          },
        },
   }
   // ... other configuration options
   resolve: {
    // 3. 设置 @hot-loader/react-dom，支持 React Hooks
    alias: {
      "react-dom": "@hot-loader/react-dom",
    },
  },};

// App.js
import { hot } from 'react-hot-loader/root';
const App = () => <div>Hello World!</div>;
export default hot(App);
```

## 微前端不同场景下热更新表现

首先，请确认微前端应用的构建配置已按照推荐配置进行了设置：

```js
// webpack.config.js
module.exports = {
  output: {
    // 开发环境设置 true 将会导致热更新失效
    clean: process.env.NODE_ENV === 'production' ? true : false,
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].js',
    // 需要配置成 umd 规范
    libraryTarget: 'umd',
    // 修改不规范的代码格式，避免逃逸沙箱
    globalObject: 'window',
    jsonpFunction: 'garfish-demo-react17',
    // 保证子应用的资源路径变为绝对路径
    publicPath: 'http://localhost:8080',
  },
};
```

### 主、子 应用都在本地

- 支持主应用热更新；
- 支持子应用热更新；

### 主应用线上、子应用线下

- 子应用独立启动时，子应用热更新能力不受影响；
- 在微前端模式下的子应用（即主应用线上加载的线下子应用）
  - 【若当前域名为子应用域名】：子应用 hmr 能力不受影响；
  - 【若当前域名为主应用域名】：需要指定 ws 的连接地址为本地 ws 连接

```js
// 以 webpack 为例，可以通过 devServer 的 client.webSocketURL 来指定 ws 地址
// 值得注意的是，当本地地址指定为 0.0.0.0 时，ws 指定为本地并未生效, 即依然为ws的默认连接地址(当前域名)
// 可以指定本地地址 localhost 或者 127.0.0.1 ，请保证该 ws 连接有效

module.exports = {
  devServer: {
    hot: true,
    open: true,
    historyApiFallback: true,
    port,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    allowedHosts: 'all',
    // 配置 webSocketURL 地址为本地 ws, 达到微前端模式下子应用热更新的能力
    client: {
      webSocketURL: 'ws://localhost:8091/ws', // ok
      // webSocketURL: 'ws://127.0.0.1:8091/ws', // ok
      // webSocketURL: 'ws://0.0.0.0:8091/ws', // wrong

      // webSocketURL: {
      //   hostname: 'localhost', // ok
      //   hostname: '127.0.0.1', // ok
      //   hostname: '0.0.0.0',  // wrong
      //   pathname: '/ws',
      //   password: 'dev-server',
      //   port: 8091,
      //   protocol: 'ws',
      //   username: 'webpack',
      // },
    },
  },
};
```

## 常见问题

### 子应用热更新未生效

主应用线下、子应用线下场景：

- 首先检查子应用作为独立应用启动时，是否具备热更新能力。
  - 如果子应用运行没有 HMR 能力，需要排查问题
    - 若使用了 react-fast-refresh。webpack 的  externals  配置项会导致  react-refresh  失效，可在  dev 环境下可以先关闭配置。
    - 若使用了 react-fast-refresh。react-refresh 最低支持版本  react-dom@16.9+，如果热更新没有生效，请确认版本是否满足要求。
    -
- 如果子应用作为独立应用启动时，具备热更新能力，但微前端模式下未生效，可能原因：

  - 若主应用使用了 react-fast-refresh webpack 插件作为热更新配置，请关闭该配置：

    ```js
    // webpack 场景，禁用 react-fast-refresh ，可改用 webpack hot.module 回调
    // 或使用 react-hot-loader
    plugins: [
        // 微前端场景下子应用热更新需要关闭 react-fast-refresh, 否则子应用热更新不会生效
        // isDevelopment && new ReactRefreshWebpackPlugin()
      ],
    ```

    - 禁用 react-fast-refresh 后，根组件可使用 webpack hot.module 回调，达到热更新效果

    ```js
    // 根组件使用 webpack hot.module 回调，达到热更新效果
    // index.tsx
    import ReactDOM from 'react-dom';
    import App from './components/App';

    // 设置 hot.module 回调开启热更新：
    if ((module as any).hot) {
      (module as any).hot.accept(['./components/App'], () => {
        ReactDOM.render(<App />, document.getElementById('root'));
      });
    };
    ```

    - 禁用 react-fast-refresh，也可以使用 react-hot-loader ，达到热更新效果

    ```js
    // App.tsx
    import { hot } from 'react-hot-loader';
    const RootComponent = () => {
        ...
    }
    export default hot(module)(RootComponent);

    // index.tsx
    import ReactDOM from 'react-dom';
    import App from './components/App';

    // 设置 hot.module 回调开启热更新：
    if ((module as any).hot) {
      (module as any).hot.accept(['./components/App'], () => {
        ReactDOM.render(<App />, document.getElementById('root'));
      });
    };
    ```

主应用线上、子应用线下场景：

- 【若在主应用域名下】

  - 观察子应用 ws 连接是否正常，若 ws 连接失败需要指定 ws 地址为本地 ws 地址；

- 【若在子应用域名下】
  - 正常情况下子应用的 hmr 能力应不受影响。若出现 ws 连接正常，资源请求正常，页面未正确更新。若使用的是 react-fast-refresh 插件，请确认项目中该插件仅注册了一次（一般情况下我们一次性也需要跑一个 dev 的应用），原因是 react-refresh 中存在防重复注入机制，若加载多次，新的 webpack runtime 中 劫持 **REACT_DEVTOOLS_GLOBAL_HOOK** 相关的代码并不会再次被执行。当代码变更 webpack 进行热更新时，因为闭包的原因，mountedRootsSnapshot 这个变量寻找的是之后加载的 runtime 里定义的模块里的变量，长度为 0，直接跳过更新阶段。这也是主、子应用均为 dev 模式下子应用若需要热更新，那么主应用需要关闭 react-fast-refresh 的原因。

```js
/* global __react_refresh_library__ */

const safeThis = require('core-js-pure/features/global-this');
const RefreshRuntime = require('react-refresh/runtime');

if (process.env.NODE_ENV !== 'production') {
  if (typeof safeThis !== 'undefined') {
    var $RefreshInjected$ = '__reactRefreshInjected';
    // Namespace the injected flag (if necessary) for monorepo compatibility
    if (
      typeof __react_refresh_library__ !== 'undefined' &&
      __react_refresh_library__
    ) {
      $RefreshInjected$ += '_' + __react_refresh_library__;
    }

    // Only inject the runtime if it hasn't been injected
    if (!safeThis[$RefreshInjected$]) {
      // Inject refresh runtime into global scope
      RefreshRuntime.injectIntoGlobalHook(safeThis);

      // Mark the runtime as injected to prevent double-injection
      safeThis[$RefreshInjected$] = true;
    }
  }
}
```

### 主应用热更新后子应用内容丢失

这种情况发生在主、子 应用都为本地的场景下。在子应用页面下主应用热更新后子应用内容丢失。
此问题 garfish 方案已解决。请升级 garfish 至最新版本。
