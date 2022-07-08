---
title: vite 子应用
slug: /guide/demo/vite
order: 4
---

import ViteConfig from '@site/src/components/config/_viteConfig.mdx';

本节我们将详细介绍 vite 框架的应用作为子应用的接入步骤。[demo](https://github.com/modern-js-dev/garfish/tree/main/dev/app-vue-vite)

### 子应用沙箱状态

当 vite 应用作为子应用接入 garfish 时，我们要求子应用沙箱需关闭，否则应用将不能正常运行。

:::info 请注意：
1. 子应用沙箱默认为开启状态，请[设置子应用沙箱关闭](/guide/demo/vite#设置子应用沙箱关闭)；
2. 在关闭沙箱的场景下，子应用的副作用将会发生逃逸，请确保子应用卸载后对应全局的副作用被清除；
:::

### 设置子应用沙箱关闭

```js
// 主应用工程中，Garfish.run 处设置：
Garfish.run({
  ...,
  apps: [
    {
      name: 'sub-app',
      activeWhen: '/vite',
      sandbox: false
    }
  ]
})
```

:::caution
注意，不要设置 Garfish.run() 顶层的 sandbox 属性，这会导致所有子应用的沙箱关闭。
:::

## vite 子应用接入步骤

### 1. bridge 依赖安装

:::tip
1. 请注意，桥接函数的安装不是必须的，你可以自定义导出函数。
2. 我们提供桥接函数是为了进一步降低用户接入成本并降低用户出错概率，桥接函数中将会内置一些默认行为，可以可以避免由于接入不规范导致的错误，所以这也是我们推荐的接入方式。
:::

```bash npm2yarn
npm install @garfish/bridge-vue-v3 --save
```
### 2. 入口文件处导出 provider 函数

更多 bridge 函数参数介绍请参考 [这里](/guide/bridge)

```js
// src/main.js
import { h } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { vueBridge } from '@garfish/bridge-vue-v3';
import App from './App.vue';

function newRouter(basename) {
  const router = createRouter({
    history: createWebHistory(basename),
    base: basename,
    routes,
  });
  return router;
}

export const provider = vueBridge({
  rootComponent: App,
  // 可选，注册 vue-router或状态管理对象
  appOptions: ({ basename, dom, appName, props }) => ({
    el: '#app',
    render: () => h(App),
    router: newRouter(basename),
  }),
});
```

### 3. 根组件设置路由的 basename

:::info
1. 为什么要设置 basename？请参考 [issue](../../issues/childApp.md#子应用拿到-basename-的作用)
2. 我们强烈建议使用从主应用传递过来的 basename 作为子应用的 basename，而非主、子应用约定式，避免 basename 后期变更未同步带来的问题。
3. 目前主应用仅支持 history 模式的子应用路由，[why](../../issues/childApp.md#为什么主应用仅支持-history-模式)
:::

```js
// src/main.js
import { h } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { vueBridge } from '@garfish/bridge-vue-v3';
import App from './App.vue';

function newRouter(basename) {
  const router = createRouter({
    history: createWebHistory(basename),
    base: basename,
    routes,
  });
  return router;
}
```

### 4. 更改 vite 配置

<ViteConfig />

### 5. 增加子应用独立运行兼容逻辑

:::tip
last but not least, 别忘了添加子应用独立运行逻辑，这能够让你的子应用脱离主应用独立运行，便于后续开发和部署。
:::

```js
// src/main.js
if (!window.__GARFISH__) {
  // 非微前端环境直接运行
  const vueInstance = createApp(App);
  vueInstance.mount(document.querySelector('#app'));
}
```
