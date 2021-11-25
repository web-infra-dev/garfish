---
title: 微前端主应用
slug: /guide/develop/main-app
order: 1
---

本节主要从主应用视角出发，通过 `Web Component` 和 `JavaScript api` 两种微前端加载方式概览性描述主应用如何接入微前端子应用，并不包括如何提供一个微前端子应用，如何提供微前端子应用请移步 **[微前端子应用](./sub-app)** 章节

## 使用 Web Component 接入微前端子应用

通过 web component 接入子应用整体流程概述为：

1. 添加 `@garfish/web-component` 依赖
1. 使用 `defineCustomElements` API 定义微前端 Web Component 组件
1. 通过微前端 WebComponent 组件，加载微前端子应用

### 安装依赖

```bash npm2yarn
npm install @garfish/web-component --save
```

### 在主应用入口处注册 Web Component

```js
// index.js
import { defineCustomElements } from '@garfish/web-component';

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

### React 主应用接入方式

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
        <Route path="/vue-app" component={() => Vue2('/vue-app')}></Route>
      </Switch>
    </BrowserRouter>
  );
}
```

### Vue 主应用接入方式

```vue
<template>
  <div>
    <micro-portal name="react16" entry="http://localhost:8093" basename="/" />
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>
<style></style>
```

## 使用 Garfish API 加载微前端子应用

通过 Garfish API 接入子应用整体流程概述为：

1. 添加 `garfish` 依赖包
2. 通过 `Garfish.run`，提供挂载点、basename、子应用列表信息

### 安装依赖

```bash npm2yarn
npm install garfish --save
```

### 在主应用上注册子应用并启动 Garfish

```js
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
