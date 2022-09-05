---
title: 常见问题
slug: /issues
order: 1
---

import WebpackConfig from '@site/src/components/config/_webpackConfig.mdx';

## "provider" is "null".

出现这个问题是因为 garfish 无法从子应用中正确获取到 `provider` 导出函数，可以先按照以下步骤自查：

1. 检查子应用是否正确 export 了 provider 函数。[参考](/guide/start#2导出-provider-函数)
2. 检查子应用是否正确配置了 webpack 的 output 配置：

<WebpackConfig />

3. 确认子应用 `entry` 地址设置正确：若为 html 的入口类型 `entry` 配置为 html 入口地址，若为 js 类型，子应用 `entry` 配置为 js 入口地址；

4. 若子应用为 js 入口，需要保证子应用的资源被打包成了单 bundle，若有部分依赖未被打包成 bundle 会导致子应用无法正常加载。例如子应用使用了 webpack splitChunk 进行拆包且为 js 入口时，会导致上述报错；

5. 如以上途径都无法解决，请试图通过环境变量导出，这将会让 Garfish 框架更准确的获取到导出内容：

```js
if (window.__GARFISH__ && typeof __GARFISH_EXPORTS__ !== 'undefined') {
  // eslint-disable-next-line no-undef
  __GARFISH_EXPORTS__.provider = provider;
}
```

## Uncaught (in promise) TypeError: [Garfish warning]: Cannot read properties of undefined (reading 'call')

- 错误原因

  - 这个问题出现在子应用构建为 umd 格式后存在脚本出现了 `type="module"` 的标识，这将导致该 script 逃逸出沙箱执行，而其余脚本在沙箱内执行，找不到 chunk 导致报错。

- 解决方案
  - 请确保子应用构建为 umd 格式后 script 不会带上 `type="module"` 标识，保证子应用的正常解析和渲染。

## Invalid domGetter "xxx"

错误原因：在 Garfish 开始渲染时，无法查询到该挂载节点则会提示该错误

> 解决方案

1. 将挂载点设置为常驻挂载点，不要跟随路由变化使子应用挂载点销毁和出现
2. 保证 Garfish 在渲染时挂载点存在

## 如何获取主应用的 localStorage

可按照如下配置获取主应用的 localStorage：

```ts
import Garfish from 'garfish';

Garfish.run({
  ...,
  sandbox: {
    modules: [
      () => ({
        override: {
          localStorage: window.localStorage,
        },
      }),
    ],
  }
});
```

类似 localStorage，子应用若需要获取被沙箱隔离机制隔离的全局变量上的变量，均可通过上述方式获取。

## 如何判断子应用是否微前端应用中

可通过环境变量 `window.__GARFISH__` 判断。

## 如何手动挂载子应用

可通过 [Garfish.loadApp](/api/loadApp) 动态加载子应用。

## HTML entry 和 JS entry 差异

* HTML entry
  * 指的是子应用配置的资源地址是 HTML 的地址
  * 指定子应用的 entry 地址为 HTML 地址，支持像 iframe 一样的能力，将对应的子应用渲染至当前应用中
  * HTML entry 模式的作用设计的初衷，解决子应用：**独立开发**、**独立测试** 的能力

* JS entry
  * 指的是子应用配置的资源地址就是一个 JS 地址

* 二者在使用层面上的差异
  * 在作为 `html entry` 时，子应用的挂载点需要基于传入的 `dom` 节点进行选中挂载点
  * 因为在 `html entry` 时，其实类似于 `iframe` 的模式，子应用在独立运行时的所有 `dom` 结构都会被挂到主应用的文档流上（整个文档流会挂载在当前 html 上）
  * 所以子应用在渲染时需要根据子应用的 `dom` 结构去找他的挂载点。

- HTML entry 正确渲染销毁写法

```js {6}
export const provider = () => {
  return {
    render({ dom }) {
      ReactDOM.render(
        React.createElement(HotApp),
        dom.querySelector('#root'), // 基于 dom 去选中文档流中的 #root，就和在独立运行时使用 document.querySelector('#root') 一样
      );
    },
    destroy({ dom }) { // 此外，destroy 应该正确的执行
      const root = dom && dom.querySelector('#root');
      if (root) {
        ReactDOM.unmountComponentAtNode(root);
      }
    },
  }
}
```

- JS entry 正确渲染销毁写法

```js
export const provider = ({ dom , basename}) => ({
  render(){
  	ReactDOM.render(<App basename={basename} />, dom); // 作为 js entry 时，没有自己的文档流，只有提供的渲染节点
  },

  destroy({ dom }) {
    ReactDOM.unmountComponentAtNode(dom); // 没有自己的文档流，直接销毁
  },
});
```
## garfish 支持多实例吗

支持。

目前 garfish 支持多实例场景，业务使用场景可分为 「非嵌套场景」 和 「嵌套场景」：

- 非嵌套场景下
+ 非嵌套场景下，子应用请勿在安装引入 Garfish 包，并导入使用。
+ 子应用如果想要在微前端场景下使用 Garfish 包的相关能力，可判断在微前端环境内时，通过 `window.Garfish` 使用相关接口。

```js
if (window.__GARFISH__) {
  window.Garfish.xx
}
```

- 嵌套场景
+ Garfish 目前内部的设计都支持嵌套场景，如果业务对这一块有诉求可以使用，协助我们一起推进在嵌套场景下的能力。


## 子应用销毁后重定向逻辑影响其他子应用

可能原因，出现该问题的原因是子应用未正常销毁，当子应用未正常销毁时，其路由监听事件也未跟随子应用的销毁而销毁

> React 应用解决方案

- 需要保证渲染的节点和销毁的节点为同一个节点，否则导致 React 组件销毁不正常，[ReactDOM.unmountComponentAtNode API 使用说明](https://reactjs.org/docs/react-dom.html#unmountcomponentatnode)
- 这里需要注意的是子应用的入口类型，如果子应用是构建为 js 入口时，则不存在 html 模板，可以直接将 dom 作为挂载点。但也需要保证渲染和销毁的为同一个节点

```js
export const provider = () => {
  return {
    render: ({ dom, basename }) => {
      const root = dom ? dom.querySelector('#root') : document.querySelector('#root');
      ReactDOM.render(
        <React.StrictMode>
          <App basename={basename} />
        </React.StrictMode>,
        root,
      );
    },

    destroy: ({ dom, basename }) =>{
      const root = dom ? dom.querySelector('#root') : document.querySelector('#root');
      ReactDOM.unmountComponentAtNode(root),
    },
  };
};
```

## You are attempting to use a basename on a page whose URL path does not begin with the basename.

> 问题原因

- 出现这个错误的原因一般是因为子应用没有正确的设置子应用的 basename 所导致的。
- 子应用的 `basename` = 主应用的 `basename` + 子应用设置的激活路径 `activeWhen`，这个值会在生命周期函数中由 garfish 默认通过通过参数传递过来，直接使用即可。

> 解决方案

- 将生命周期函数中主应用传递过来的 `basename` 设置为子应用的 `basename`。[参考](/guide/demo/react#3-根组件设置路由的-basename)

## 刷新直接返回子应用内容

> 问题原因

- 微前端是一个 SPA 应用，加载子应用是通过 SPA 模式来动态的加载其他子应用内容
- 当访问到主应用的某个路径下激活子应用时是不存在这个路径下的静态资源的，从而 failback 到主应用的内容
- Garfish 在初始化时根据当前路径来确定加载的子应用
- 如果在访问主应用的某个路径时来加载子应用，而这个地址已经存在一个静态资源，浏览器将会直接返回该资源

> 解决方案

- 子应用的资源地址不要和主应用上面激活路径的资源地址一致

## 子应用的接口和资源路径不正确

尽可能将子应用的接口请求和资源路径调整为绝对路径

1. 子应用在独立运行时，使用相对路径的接口，接口请求的路径是，当前页面域名+相对路径
2. 但是在主应用时，子应用使用相对路径的接口，请求的路径按道理来说还是，当前域名+相对路径

当在微前端的场景下如果 Garfish 让子应用走「当前域名+相对路径」会发生更多的异常请求（hmr 热更新、websock、server worker ...），因为子应用的域名并不一定是与主应用一致，因此 Garfish 框架会对相对路径的资源和请求去进行修正，修正的参照物为基础域名为子应用的路径，在本地开发时可能是正常的，但是发到线上出现问题，原因在于发布到线上之后，Goofy web 为了提升子应用资源加载的性能，子应用的入口会走 CDN。因此参照的基础路径就变为了 CDN 前缀。那么此时子应用的相对路径请求就变为了 CDN 前缀。这一块做了很对权衡，因为 hmr、websock、server worker 这些内容可能难以被用户控制，所以默认走的还是修正模式。

## 为什么主应用仅支持 history 模式？

- 目前 Garfish 是通过命名空间去避免应用间的路由发生冲突的。

- 主应用仅支持 `history` 模式的原因在于，`hash` 路由无法作为子应用的基础路由，从而可能导致主应用和子应用发生路由冲突。

## 根路由作为子应用的激活条件？

- 有部分业务想将根路径作为子应用的激活条件，例如 `garfish.bytedance.com` 就触发子应用的渲染，由于目前子应用 **字符串的激活条件为最短匹配原则**，若子应用 `activeWhen: '/'` 表明 `'/xxx'` 都会激活。

- 之所以为最短匹配原则的原因在于，我们需要判断是否某个子应用的子路由被激活，如果可能是某个子应用的子路由，我们则可能激活该应用。

- 之所以有该限制是由于若某个子应用的激活条件为 `/`，则该应用的 `/xx` 都可能为改子应用的子路由，则可能与其他应用产生冲突，造成混乱。

## 子应用拿到 basename 的作用？

为什么推荐子应用拿通过 `provider` 传递过来的 `basename` 作为子应用的 `basename`，有些业务方在实际过程中直接通过约定形式直接在子应用增加 `basename` 已到达隔离的效果，但该使用方式可能导致主应用如果变更 `basename` 可能导致子应用无法一起变更生效。

例如：

1. 当前主应用访问到 `garfish.bytedance.com` 即可访问到该站点的主页，当前 `basename` 为 `/`，子应用 vue，访问路径为 `garfish.bytedance.com/vue`

2. 如果主应用想更改 `basename` 为 `/site`，则主应用的访问路径变为`garfish.bytedance.com/site`，子应用 vue 的访问路径变为 `garfish.bytedance.com/site/vue`

3. 所以推荐子应用直接将 `provider` 中传递的 `basename` 作为自身应用的基础路由，以保证主应用在变更路由之后，子应用的相对路径还是符合整体变化

> 微前端场景下，每个子应用可能都有自己的路由场景，为保证子应用间路由不冲突，Garfish 框架将配置的 `basename` + `子应用的 activeWhen` 匹配的路径作为子应用的基路径。

- 若在 Garfish 上配置 `basename: /demo`，子应用的激活路径为：`/vue2`，则子应用得到的激活路径为：`/demo/vue2`
- 若子应用的激活条件为函数，在每次发生路由变化时会通过校验子应用的激活函数若函数返回 `true` 表明符合当前激活条件将触发路由激活，
- Garfish 会将当前的路径传入激活函数分割以得到子应用的最长激活路径，并将 `basename` + `子应用最长激活路径传` 给子应用参数
- **子应用如果本身具备路由，在微前端的场景下，必须把 basename 作为子应用的基础路径，没有基础路由，子应用的路由可能与主应用和其他应用发生冲突**

## 子应用使用 style-component 切换子应用后样式丢失

- 开启 Style-component 后在生产模式下 style 将会插入到 sheet 中（[React Styled Components stripped out from production build](https://stackoverflow.com/questions/53486470/react-styled-components-stripped-out-from-production-build)）
- 应用重渲染后 style 重新插入后依然，但是 sheet 未恢复

解决方案在使用 `style-component` 的子应用添加环境变量：`REACT_APP_SC_DISABLE_SPEEDY=true`

### arco-design 多版本样式冲突

1. [Arco-design 全局配置 ConfigProvider](https://arco.design/react/components/config-provider)
2. 给子应用分别设置不同的 `prefixCls` 前缀

### ant-design 样式冲突

1. 配置 `webpack` 配置

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.less$/i,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          {
            loader: 'less-loader',
            options: {
              modifyVars: {
                '@ant-prefix': 'define-prefix', // 定制自己的前缀
              },
              javascriptEnabled: true,
            },
          },
        ],
      },
    ],
  },
};
```

2. 配置公共前缀：[antdesign-config](https://ant.design/components/config-provider/#API)

```js
import { ConfigProvider } from 'antd';

export default () => (
  <ConfigProvider prefixCls="define-prefix">
    <App />
  </ConfigProvider>
);
```
## 子应用热更新问题
garfish 子应用热更新问题请参考 [博客](/blog/hmr)

## 如何独立运行子应用

通过 `window.__GARFISH__` 可判断当前子应用是否处于微前端下，通过此变量判断何时独立运行子应用：

```js
// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';

// 这能够让子应用独立运行起来，以保证后续子应用能脱离主应用独立运行，方便调试、开发
if (!window.__GARFISH__) {
  ReactDOM.render(<App />, document.querySelector('#root'));
}
```
## 已有 `SPA` 应用如何改造为 garfish 子应用
### 场景描述
+ 很多需要改造成微前端的 `SPA` 应用，都是已经存在的旧应用。
+ 可能需要逐步拆解应用内的部分路由，变为子应用。
+ 主应用现有路由如何与微前端路由驱动共存，是迁移过程中常遇到的。

### 如何逐步改造（以 `react` 为例）
1. 增加 `id` 为 `micro-app` 的挂载点，预留给子应用挂载，`Router` 部分的内容为主应用其他路由。
2. 主应用增加匹配到子应用路由前缀时，`Router` 内容为空。
3. 配置子应用列表时以 `Router` 内容为空时的前缀作为子应用激活条件前缀。


主应用的根组件：
```jsx
<BrowserRouter getUserConfirmation={ getConfirmation }>
  <RootContext.Provider value={ provider }>
    <Header />
    <div className="container">
      <Router routes={ routes } />
      <div id="micro-app" />
    </div>
  </RootContext.Provider>
</BrowserRouter>
```

routes：
```js
export default [
  {
    path: '/platform/search',
    component: Search,
  },
  {
    // 以 /platform/micro-app 开头的应用Router都不展示内容
    path: '/platform/micro-app',
    component: function () {
      return null;
    },
  },
  {
    component: Home,
  },
];
```

主入口处：
```js
Garfish.run({
  domGetter: '#micro-app',
  basename: '/platform/micro-app',
  apps: [
    ...
  ],
});
```
## 子应用动态插入到 body 上的节点逃逸？

- 首先 garfish 会对每一个子应用创建一个 app container 用于包裹子应用，会创建 `__garfishmockhtml__`、 `__garfishmockbody__` 等 mock 节点。
- 对于在子应用运行过程中动态添加到 body 上的节点（如 drawer 组件），garfish 并未
  将此类节点移动到 mock 的 `__garfishmockbody__` 中，原因是有些组件库会计算在 dom 层级中的位置，所以目前 garfish 会主动让其逃逸到上层。
- 在子应用运行过程中动态添加到 body 上的节点在子应用卸载时，garfish 并不会默认回收其 DOM 副作用，需要用户主动在组件的销毁回调里触发 dom 的回收，防止 DOM 副作用未销毁带来的影响。

## 子应用 addEventListener 注册的事件监听在子应用卸载后并未销毁

- 若子应用默认开启了缓存模式，在子应用卸载时会保留应用的上下文，不会默认清除 addEventListener 注册的事件监听，这是因为再次渲染该子应用时 garfish 只会执行 render 函数，因此子应用的副作用不会随意被清除。

- 这种情况建议用户在组件的销毁函数里面手动释放组件的副作用，若有些逻辑确实需要清除，并且需要保证应用可用性可以将 cache 设置成 false。

## garfish 缓存模式

1. garfish 目前默认启用了缓存模式，在缓存模式下 garfish 会保留应用的上下文，且不会重新执行所有代码，只会执行 render 的 destory 函数，因此应用的性能将得到很大的提升。

2. 在缓存模式下 garfish 只会隔离环境变量和样式，子应用卸载时会保留应用的上下文，不会默认清除子应用的副作用。若业务存在需要销毁的副作用，一般来说建议用户在组件的销毁函数里面手动释放组件的副作用，如果有些逻辑确实需要清除，并且需要保证应用可用性可以把 cache 设置成 false。

## JS 错误上报 Script error 0

- 一般错误收集的工具都是通过：
  - `window.addEventListener('error', (...args) => { console.log(args) })`
  - `window.addEventListener('unhandledrejection', (...args) => { console.log(args) })`
- 如果能打印出 error 对象，但是只能拿到类似 Script error 0. 这类信息。说明当前 js error 跨域了【由于浏览器跨域的限制，非同域下的脚本执行抛错，捕获异常的时候，不能拿到详细的异常信息，只能拿到类似 Script error 0. 这类信息】。通常跨域的异常信息会被忽略，不会上报。可以通过一下方法验证是否跨域（如果输出 Script error 0. 则为跨域）

> 解决方案

由于浏览器跨域的限制，非同域下的脚本执行抛错，捕获异常的时候，不能拿到详细的异常信息，只能拿到类似 Script error 0. 这类信息。通常跨域的异常信息会被忽略，不会上报。解决方案： 所有 `<script>` 加载的资源加上 `crossorigin="anonymous"`

## 子应用热更新问题

garfish 子应用热更新问题请参考 [博客](/blog/hmr)

## cdn 第三方包未正确挂在在 window 上

> 问题概述

- 一般常见的基础库都有提供 cdn 的加载方式，这些 cdn 的基础库都会构建成 umd 格式，构建成 umd 格式的包，可以正常的支持各类环境的使用，当在浏览器环境时通常会将基础库的导出内容在 window 上添加一个环境变量，在基础库加载完成后可通过环境 window 上对应的环境变量使用基础库的一些方法
- 但是在微前端的子应用内，会发现在对应的基础库 cdn 加载完成后并未有效的挂在在 window 环境变量上，由于 v5 版本之前获取子应用导出内容的规范，子应用的 js 代码会运行在 commonjs 环境中，由于基础库构建成为了 umd 包，umd 的构建行为判断在 commonjs 环境中会将环境变量放置 exports 中，所以并未放置 window 环境变量

> 解决方案

- 将对应的 cdn script 增加 no-entry 属性：`<script no-entry="true" src="xxx"></script>`，设置该属性后对应的 script 内容将不会运行在 commonjs 环境，对应的环境变量也会正常的插入到子应用的 window 上

## SyntaxError: Identifier 'exports' has already been declared

> 问题概述

这个问题其实和上面那个cdn的问题，原因是一样的，由于garfish会注入一个exports变量，而子应用某个脚本（比如vite自己的热更引入的`react-refresh-runtime.development.js`）的代码也写了类似`const exports = {}`的代码，导致出现重复声明而报错。

> 解决方案

解决办法还是和上面加`no-entry`一样，不会注入commonjs相关的环境变量，但是，考虑到某些脚本可能是构建工具默认注入的，无法修改script标签，所以可以在html入口处加入以下配置代码来达到同样的效果（以vite的`react-refresh`为例）：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>vue sub app</title>
    <!-- 必须是合法的JSON字符串，匹配规则很简单，就是实际加载的url字符串indexOf你的规则 -->
    <script type="garfish-config">
      {
        "sandbox": {
          "noEntryScripts": ["@react-refresh"]
        }
      }
    </script>
    <!-- 省略其它多余的代码 -->
  </head>
  <body>
    <div id="app"></div>
    <!-- 省略其它多余的代码 -->
  </body>
</html>
```

## ESModule

Garfish 核心库默认支持 esModule，但是需要关掉 vm 沙箱或者为快照沙箱时，才能够使用。

```js
Garfish.run({
  ...
  apps: [
    {
      name: 'vue'，
      activeWhen: '/vue',
      entry: 'http://localhost:8080',
      sandbox: {
        open: false,
        // snapshot: true, 或者只开启快照沙箱
      },
    },
  ],
})
```

如果需要在 vm 沙箱下开启 esModule 的能力，可以使用 `@garfish/es-module` 插件。

> `@garfish/es-module` 会在运行时分析子应用的源码做一层 esModule polyfill，但他会带来严重的首屏性能问题，如果你的项目不是很需要在 vm 沙箱下使用 esModule 就不应该使用此插件。

> 在短期的规划中，为了能在生产环境中使用，我们会尝试使用 wasm 来优化整个编译性能。在未来如果 [module-fragments](https://github.com/tc39/proposal-module-fragments) 提案成功进入标准并成熟后，我们也会尝试使用此方案，但这需要时间。

```js
import { GarfishEsModule } from '@garfish/es-module';

Garfish.run({
  ...
  plugins: [GarfishEsModule()],
})
```

> 提示：当子项目使用 `vite` 开发时，你可以在开发模式下使用 esModule 模式，生产环境可以打包为原始的无 esModule 的模式。

## 子应用堆栈信息丢失、sourcemap 行列信息错误

> 问题背景

微前端场景下，存在沙盒机制，基于 eval 和 new Function 的形式去实现沙箱机制，在手动执行代码的情况下，会产生堆栈丢失、sourcemap 还原错行等问题。

> 解决方案

可通过增加如下 webpack 配置解决：

```js
// webpack.config.js
const webpack = require('webpack');

config.plugins = [
  new webpack.BannerPlugin({
      banner: 'Micro front-end',
  });
]
```

具体原因可参考 [博客](/blog/sourcemap)
