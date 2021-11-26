---
title: JavaScript API 接入
slug: /guide/develop/js-api
order: 2
---

本节主要从主应用视角出发，通过 `Garfish api` 的加载方式概览性描述主应用如何接入微前端子应用

通过 Garfish API 接入子应用整体流程概述为：

1. 添加 `garfish` 依赖包
2. 通过 `Garfish.run`，提供挂载点、basename、子应用列表信息

## 主应用

### 安装依赖

```bash npm2yarn
npm install garfish --save
```

### 在主应用入口处注册子应用并启动 Garfish

```js
// index.js（主应用入口处）
import Garfish from '@byted/garfish';

Garfish.run({
  // 主应用的基础路径，该值需要保证与主应用的基础路径一致
  basename: '/',
  // 注意在执行 run 时请确保 #subApp 节点已在页面中存在，可为函数（为函数时将使用函数返回时作为挂载点）
  domGetter: '#subApp',
  apps: [
    {
      // 每个应用的 name 需要保持唯一
      name: 'react',
      // 可为函数，当函数返回值为 true 时，标识满足激活条件，该应用将会自动挂载至页面中，手动挂在时可不填写该参数
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

> 能力概述

当执行 `Garfish.run` 后，此时 `Garfish` 框架将会启动路由劫持能力，当浏览器的地址发生变化时，`Garfish` 框架内部便会立即触发匹配逻辑当应用符合匹配逻辑时将会自动将应用挂载至页面中。并依次触发子应用加载、渲染过程中的生命周期。

例如上述例子中：

- `basename: '/'`
  - React 应用的激活地址为 `/react`
  - 那么在浏览器跳转至 `/react` 以及 `/react/xxx/xx` 等路由时都会触发 React 应用都会挂载至 `domGetter` 中
- 若 `basename: '/demo'`
  - 那 React 应用的激活路径则为 `/demo/react`
  - 那么在浏览器跳转至 `'/demo/react'` 以及 `'/demo/react/xxx/xx'` 等路由时都会触发 React 应用都会挂载至 `domGetter` 中

## 子应用

### 安装依赖

```bash npm2yarn
npm install @garfish/bridge --save
```

### 调整子应用的 Webpack 构建配置

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

### 通过 Bridge 函数包装子应用

<Tabs groupId="framework">
  <TabItem value="React" label="React" default>

```jsx
import { reactBridge } from '@garfish/bridge';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom';

function App({ basename }) {
  return (
    <BrowserRouter basename={basename}>
      <Link to="/">Home</Link>
      <Switch>
        <Route exact path="/">
          <HelloGarfish />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export const provider = reactBridge({
  React,
  ReactDOM,
  domElementGetter: '#root',
  rootComponent: App,
});
```

  </TabItem>
  <TabItem value="Vue" label="Vue">

```jsx
import Vue from 'vue';
import App from './App.vue';
import { vueBridge } from '@garfish/bridge';

function newRouter(basename) {
  const router = new VueRouter({
    mode: 'history',
    base: basename,
    router,
    routes: [{ path: '/', component: HelloGarfish }],
  });
  return router;
}

export const provider = vueBridge({
  Vue,
  rootComponent: App,
  appOptions: ({ basename }) => {
    const router = newRouter(basename);
    return {
      el: '#app',
      router,
      store,
    };
  },
});
```

  </TabItem>
  <TabItem value="Other" label="Other">
    This is a banana 🍌
  </TabItem>
</Tabs>

## 总结

使用 Garfish API 搭建一套微前端主子应用的主要成本来自两方面

- 主应用的搭建
  - 注册子应用的基本信息
  - 使用 Garfish 在主应用上调度管理子应用
- 子应用的改造
  - 增加对应的构建配置
  - 使用 `@garfish/bridge` 包提供的提供的包装后返回 `provider` 函数并导出
  - 子应用针对不同的框架类型，添加不同 `basename` 的设置方式
    - React 在根组件中获取 `basename` 将其传递至 `BrowserRouter` 的 `basename` 属性中
    - Vue 将 `basename` 传递至 `VueRouter` 的 `basename` 属性中
