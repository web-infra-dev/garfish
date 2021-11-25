---
title: 从零开始搭建
slug: /guide/develop/from-zero
order: 4
---

## 主应用

### 1. 安装 Garfish

```bash
$ yarn add garfish # or npm i garfish -S
```

### 2. 在主应用上注册子应用并启动 Garfish

```js
import Garfish from 'garfish';

Garfish.run({
  // 主应用的基础路径，该值需要保证与主应用的基础路径一致
  basename: '/',
  // 注意在执行 run 时请确保 #subApp 节点已在页面中存在，可为函数（为函数时将使用函数返回时作为挂载点）
  domGetter: '#subApp',
  apps: [
    {
      // 每个应用的 name 需要保持唯一
      name: 'react',
      // 可为函数，当函数返回值为 true 时，标识满足激活条件，该应用将会自动挂载至页面中，手动挂载时可不填写该参数
      activeWhen: '/react',
      // 子应用的入口地址，可以为 HTML 地址和 JS 地址（为不同模式时，渲染函数的处理有所不同）
      entry: 'http://localhost:3000',
    },
    {
      name: 'vue',
      activeWhen: '/vue',
      entry: 'http://localhost:8080',
    },
  ],
});
```

当执行注册子应用相关信息并执行 `Garfish.run` 后，此时 `Garfish` 框架将会启动路由劫持能力，当浏览器的地址发生变化时，`Garfish` 框架内部便会立即触发匹配逻辑当应用符合匹配逻辑时将会自动将应用挂载至页面中。并依次触发子应用加载、渲染过程中的生命周期。

例如上述例子中：

- `basename: '/'`
- React 应用的激活地址为 `'/react'`
- 那么在浏览器跳转至 `/react` 以及 `'/react/xxx/xx'` 等路由时都会触发 React 应用都会挂载至 `domGetter` 中
- 若 `basename: '/demo'`，那 React 应用的激活路径则为 `/demo/react` 以及 `'/demo/react/xxx/xx'`

> **手动挂载**

在业务的实际场景中，应用的挂载并不一定是跟随路由的变化而挂载的，可能通过某些事件触发从而使用挂载能力，详细使用细节可参考 **[手动挂载](../advance/loadApp)**

```javascript
import Garfish from 'garfish';

async function loadApp() {
  const app = await Garfish.loadApp('vue', {
    // loadApp 的应用会从 Garfish.run 时注册的信息上提供，手动挂载的应用 appInfo 不要提供 activeWhen
    basename: '/demo/vue',
    domGetter: '#subModule',
  });

  await app.mount();
}

loadApp();
```

## 子应用

### 1. 提供关键的渲染和销毁钩子

```js
import ReactDOM from 'react-dom';
import App from './App';

const render = ({ dom, basename }) => {
  ReactDOM.render(
    // 使用 Garfish 框架提供的 basename，子应用的所有子路由都基于该 basename，已到达路由隔离、刷新路由加载子应用组件的目标
    <App basename={basename} />,
    // 这里的 document 是 Garfish 构造的一个子应用容器，所有的内容都会被放在这里面
    // 如果是 js 入口直接渲染在 dom 即可（因为没有其他节点了）
    // 如果是 html 入口则要通过选择器渲染在自身html的dom节点里
    dom.querySelector('#root'),
  );
};

// 在首次加载和执行时会触发该函数
export const provider = () => {
  return {
    render, // 应用在渲染时会触发该 hook
    destroy({ dom }) {
      // 应用在销毁时会触发该 hook
      const root = (dom && dom.querySelector('#root')) || dom; // 若为 JS 入口直接将传入节点作为挂载点和销毁节点
      if (root) {
        // 做对应的销毁逻辑，保证子应用在销毁时对应的副作用也被移除
        ReactDOM.unmountComponentAtNode(root);
      }
    },
  };
};

// 这能够让子应用独立运行起来，以保证后续子应用能脱离主应用独立运行，方便调试、开发
if (!window.__GARFISH__) {
  render({ dom: document, basename: '/' });
}
```

### 2. 调整子应用相关构建配置

子应用除了提供 `provider` 导出内容外，还需要增加一定的 `webpack` 配置，具体配置如下，关于每个 webpack 配置意义可参考 [webpack 配置文档](https://webpack.js.org/configuration/output/#outputlibrary)

```js
module.exports = {
  output: {
    // 需要配置成 umd 规范
    libraryTarget: 'umd',
    // 修改不规范的代码格式，避免逃逸沙箱
    globalObject: 'window',
    // 请求确保每个子应用该值都不相同，否则可能出现 webpack chunk 互相影响的可能
    jsonpFunction: 'vue-app-jsonpFunction',
    // 保证子应用的资源路径变为绝对路径，避免子应用的相对资源在变为主应用上的相对资源，因为子应用和主应用在同一个文档流，相对路径是相对于主应用而言的
    publicPath: 'http://localhost:8000',
  },
  devServer: {
    // 保证在开发模式下应用端口不一样
    port: '8000',
    headers: {
      // 保证子应用的资源支持跨域，在线上后需要保证子应用的资源在主应用的环境中加载不会存在跨域问题（**也需要限制范围注意安全问题**）
      'Access-Control-Allow-Origin': '*',
    },
  },
};
```

## 总结

使用 Garfish 搭建一套微前端主子应用的主要成本来自两方面

- 主应用的搭建
  - 注册子应用的基本信息
  - 使用 Garfish 在主应用上调度管理子应用
- 子应用的改造
  - 通过导出 `provider` 提供应用的渲染、销毁生命周期
  - 在渲染生命周期中，针对提供的入口模式有所不同提供渲染节点
  - 在渲染生命周期中，使用框架提供的 `basename`，作为应用的基础 `basename`已到达路由隔离、刷新路由加载子应用组件的目标
  - 增加非微前端模式下的兼容渲染逻辑，使其子应用可独立运行（一般情况建议用户仅使用 html entry）
  - 增加对应的构建配置
