---
title: 常见问题
slug: /issues
order: 1
---

## "provider" is "object".

通过环境变量导出，将会更准确的让 Garfish 框架获取到导出内容

```js
if (window.__GARFISH__ && __GARFISH_EXPORTS__) {
  // eslint-disable-next-line no-undef
  __GARFISH_EXPORTS__.provider = provider;
}
```

## Invalid domGetter "xxx"

错误原因：在 Garfish 开始渲染时，无法查询到该挂载节点则会提示该错误

> 解决方案

1. 将挂载点设置为常驻挂载点，不要跟随路由变化使子应用挂载点销毁和出现
2. 保证 Garfish 在渲染时挂载点存在

## 推荐配置

如果在接入子应用的时候，出现了拿不到子应用导出的问题的时候。可以先按照以下步骤自查：

1. 检查子应用是否正确 `export` 了 `provider`。
2. 检查子应用是否配置了 `webpack` 的 `output` 配置。
3. 若为 `js` 入口，需要保证子应用的资源被打包成了但 `bundle`，若有部分依赖未被打包成 `bundle` 会导致无法正常加载

```js
// webpack.config.js
{
  output: {
    // 需要配置成 umd 规范
    libraryTarget: 'umd',
    // 修改不规范的代码格式，避免逃逸沙箱
    globalObject: 'window',
    // 请求确保每个子应用该值都不相同，否则可能出现 webpack chunk 互相影响的可能
    // webpack 5 使用 chunkLoadingGlobal 代替，若不填 webpack 5 将会直接使用 package.json name 作为唯一值，请确保应用间的 name 各不相同
    jsonpFunction: 'vue-app-jsonpFunction',
    // 保证子应用的资源路径变为绝对路径，避免子应用的相对资源在变为主应用上的相对资源，因为子应用和主应用在同一个文档流，相对路径是相对于主应用而言的
    publicPath: 'http://localhost:8000',
  },
}
```

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
    }
  };
};
```

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

- 有部分业务想将根路径作为子应用的激活条件，例如 `garfish.bytedance.net` 就触发子应用的渲染，由于目前子应用 **字符串的激活条件为最短匹配原则**，若子应用 `activeWhen: '/'` 表明 `'/xxx'` 都会激活。

- 之所以为最短匹配原则的原因在于，我们需要判断是否某个子应用的子路由被激活，如果可能是某个子应用的子路由，我们则可能激活该应用。

- 之所以有该限制是由于若某个子应用的激活条件为 `/`，则该应用的 `/xx` 都可能为改子应用的子路由，则可能与其他应用产生冲突，造成混乱。

## 子应用拿到 basename 的作用？

为什么推荐子应用拿通过 `provider` 传递过来的 `basename` 作为子应用的 `basename`，有些业务方在实际过程中直接通过约定形式直接在子应用增加 `basename` 已到达隔离的效果，但该使用方式可能导致主应用如果变更 `basename` 可能导致子应用无法一起变更生效。

例如：

1. 当前主应用访问到 `garfish.bytedance.net` 即可访问到该站点的主页，当前 `basename` 为 `/`，子应用 vue，访问路径为 `garfish.bytedance.net/vue`

2. 如果主应用想更改 `basename` 为 `/site`，则主应用的访问路径变为`garfish.bytedance.net/site`，子应用 vue 的访问路径变为 `garfish.bytedance.net/site/vue`

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

## 主子应用样式冲突

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

## JS 错误上报 Script error 0

- 一般错误收集的工具都是通过：
  - `window.addEventListener('error', (...args) => { console.log(args) })`
  - `window.addEventListener('unhandledrejection', (...args) => { console.log(args) })`
- 如果能打印出 error 对象，但是只能拿到类似 Script error 0. 这类信息。说明当前 js error 跨域了【由于浏览器跨域的限制，非同域下的脚本执行抛错，捕获异常的时候，不能拿到详细的异常信息，只能拿到类似 Script error 0. 这类信息】。通常跨域的异常信息会被忽略，不会上报。可以通过一下方法验证是否跨域（如果输出 Script error 0. 则为跨域）

> 解决方案

由于浏览器跨域的限制，非同域下的脚本执行抛错，捕获异常的时候，不能拿到详细的异常信息，只能拿到类似 Script error 0. 这类信息。通常跨域的异常信息会被忽略，不会上报。解决方案： 所有 `<script>` 加载的资源加上`crossorigin="anonymous"

## cdn 第三方包未正确挂在在 window 上

> 问题概述

- 一般常见的基础库都有提供 cdn 的加载方式，这些 cdn 的基础库都会构建成 umd 格式，构建成 umd 格式的包，可以正常的支持各类环境的使用，当在浏览器环境时通常会将基础库的导出内容在 window 上添加一个环境变量，在基础库加载完成后可通过环境 window 上对应的环境变量使用基础库的一些方法
- 但是在微前端的子应用内，会发现在对应的基础库 cdn 加载完成后并未有效的挂在在 window 环境变量上，由于 v5 版本之前获取子应用导出内容的规范，子应用的 js 代码会运行在 commonjs 环境中，由于基础库构建成为了 umd 包，umd 的构建行为判断在 commonjs 环境中会将环境变量放置 exports 中，所以并未放置 window 环境变量

> 解决方案

- 将对应的 cdn script 增加 no-entry 属性：`<script no-entry="true" src="xxx"></script>`，设置该属性后对应的 script 内容将不会运行在 commonjs 环境，对应的环境变量也会正常的插入到子应用的 window 上

## 为什么需要子应用提供一个 Provider 函数

- 这里的 `provider` 主要指在每个子应用入口处导出的 `provider` 函数 其中包括 `render` 和 `destroy` 函数
- 为什么 Garfish 不像 `iframe` 并不需要提供额外的内容，子应用独立时如何运行，在微前端环境就如何运行呢

> 原因

- Garfish 的初衷并不是为了取代 `iframe`，而是为了将一个单体应用拆分成多个子应用后也能保证应用一体化的使用体验
- 通过提供 `provider` 生命周期，我们可以在微前端应用中做到以下优化
  - 在应用销毁时触发对应框架应用的销毁函数，已达到对框架类型的销毁操作，应用中得一些销毁 hook 也可以正常触发
  - 在第二次应用加载时可以启动缓存模式
    - 在应用第一次渲染时的路径为，html 下载=> html 拆分=> 渲染 dom => 渲染 style=> 执行 JS => 执行 provider 中的函数
    - 在第二次渲染时可以将整个渲染流程简化为，还原子应用的 html 内容=> 执行 provider 中得渲染函数，因为子应用的真实执行环境并未被销毁，而是通过 render 和 destroy 控制对应应用的渲染和销毁
  - 避免内存泄漏
    - 由于目前 Garfish 框架的沙箱依赖于浏览器的 API，无法做到物理级别的隔离，由于 JavaScript 语法的灵活性和闭包的特性，第二次重复执行子应用代码可能会导致逃逸内容重复执行
    - 采用缓存模式时，将不会执行所有代码，仅执行 render ，将会避免逃逸代码造成的内存问题

> 弊端

启动缓存模式后也存在一定弊端，第二遍执行时 render 中的逻辑获取的还是上一次的执行环境并不是一个全新的执行环境.

下面代码中在缓存模式时和非缓存模式不同的表现

- 在缓存模式中，多次渲染子应用会导致 list 数组的值持续增长，并导致影响业务逻辑
- 在非缓存模式中，多次渲染子应用 list 数组的长度始终为 1

```js
const list = [];

export const provider = () => {
  return {
    render: ({ dom, basename }) => {
      list.push(1);
      ReactDOM.render(
        <React.StrictMode>
          <App basename={basename} />
        </React.StrictMode>,
        dom.querySelector('#root'),
      );
    },
    destroy: ({ dom, basename }) =>
      ReactDOM.unmountComponentAtNode(dom.querySelector('#root')),
  };
};
```
