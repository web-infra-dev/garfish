---
title: 使用 Web component（beta）
slug: /guide/develop/webComponent
order: 1
---

本节主要从主应用视角出发，通过 `Web Component` 概览性描微前端应用，Web Component 接入方式特点：

- 便于与主应用框架结合使用，加载微前端应用像加载组件一样简单
- 支持设置子应用 Loading 中间态、错误态占位内容
- 可以与路由驱动模式一起使用

## 主应用

### 安装依赖

```bash npm2yarn
npm install garfish --save
```

### 入口处注册 Web Component

```js
// index.js（主应用入口处）
import { defineCustomElements } from 'garfish';

// 定义 WebComponent Tag 为“micro-portal”，并指定 loading 时的内容
defineCustomElements('micro-portal', {
  loading: ({ isLoading, error, pastDelay }) => {
    let loadingElement = document.createElement('div');
    // 渲染过程中发生异常，展示异常内容
    if (error) {
      loadingElement.innerHTML = `load app get error: ${error.message}`;
      return loadingElement;
    }
    // 渲染中，并且符合延迟时间（避免 loading 闪退）
    if (pastDelay && isLoading) {
      loadingElement.innerHTML = `loading`;
      return loadingElement;
    }
    return null;
  },
});
```

### 分配路由给微前端应用

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="framework">
  <TabItem value="React" label="React" default>

```jsx
import React from 'react';
import { BrowserRouter, Route, Link, Switch } from 'react-router-dom';

function VueApp(basename) {
  // name: 子应用名称
  // entry: 子应用入口资源地址，可以为 HTML、或 JS
  // basename: 子应用路由的基础路径
  return (
    <micro-portal
      name="vue-app"
      entry="http://localhost:8092"
      basename={basename}
    ></micro-portal>
  );
}

function App() {
  return (
    <BrowserRouter basename={'/'}>
      <Link to="/vue-app">VueApp</Link>
      <Switch>
        // 分配一个路由给 vue 应用
        <Route path="/vue-app" component={() => VueApp('/vue-app')}></Route>
      </Switch>
    </BrowserRouter>
  );
}
```

  </TabItem>
  <TabItem value="Vue" label="Vue">

> 提供 ReactApp 的 Vue 组件

```html
<!-- ./component/ReactApp.vue -->
<template>
  <div>
    <micro-portal
      name="react-app"
      entry="http://localhost:8093"
      basename="/react-app"
    />
  </div>
</template>

<script>
  export default {
    name: 'App',
  };
</script>
<style></style>
```

> 将 ReactApp 组件添加到路由中

```js
// index.js
import Vue from 'vue';
import VueRouter from 'vue-router';
import ReactApp from './component/ReactApp.vue';
const router = new VueRouter({
  mode: 'history',
  base: '/',
  routers: [{ path: '/react-app', component: ReactApp }],
});
new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
```

  </TabItem>
</Tabs>

## 子应用

### 安装依赖

```bash npm2yarn
npm install @garfish/bridge --save
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
    // 根组件使用传递过来的 basename，作为应用的基础路径
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
  domElementGetter: '#root', // 应用的挂载点，如果子应用打包为 JS 入口，可不填写
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
</Tabs>

### 调整子应用的构建配置

<Tabs>
  <TabItem value="Webpack" label="Webpack" default>

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

  </TabItem>
</Tabs>
