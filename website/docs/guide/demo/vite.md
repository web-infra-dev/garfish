---
title: vite 子应用
slug: /guide/demo/vite
order: 4
---

import ViteConfig from '@site/src/components/config/_viteConfig.mdx';

本节我们将详细介绍 vite 框架的应用作为子应用的接入步骤。

## 主应用沙箱状态描述

:::info
使用 vite 应用作为子应用接入时需要注意：

1. 用户可根据自己实际情况选择将[沙箱](../concept/sandbox.md)开启或关闭;
2. 沙箱默认开启状态，若当前 vite 应用希望在沙箱开启状态下运行，主应用需要配置插件 [@garfish/es-module](../../garfish-plugins/es-module.md)，这是必须的；
3. 若当前子应用希望运行在非沙箱模式下，需要设置 sandbox 关闭属性，设置方案下面列出；
4. 此外需要注意，在关闭沙箱的场景下，子应用的副作用将会发生逃逸，你需要在子应用卸载后将对应全局的副作用清除；
:::

### 开启沙箱场景：

你需要在主应用中使用 `@garfish/es-module` 插件：

- `@garfish/es-module` 会在运行时分析子应用的源码做一层 `esModule polyfill`，但他会带来严重的首屏性能问题，如果你的项目不是很需要在 `vm` 沙箱下使用 `esModule` 就不应该使用此插件。
- 在短期的规划中，为了能在生产环境中使用，我们会尝试使用 `wasm` 来优化整个编译性能。在未来如果 [module-fragments](https://github.com/tc39/proposal-module-fragments) 提案成功进入标准并成熟后，我们也会尝试使用此方案，但这需要时间。

```bash npm2yarn
npm install @garfish/es-module --save
```

```js
// 主应用工程中，Garfish.run 前执行：
import { GarfishEsModule } from '@garfish/es-module';
Garfish.usePlugin(GarfishEsModule());
```

:::tip 提示
当子项目使用 vite 开发时，你可以在开发模式下使用 esModule 模式，生产环境可以打包为原始的无 esModule 的模式。
:::

### 关闭沙箱场景：

1. 你需要关闭当前应用的沙箱机制（默认开启，如果你不设置会开启）
2. 子应用的副作用将会发生逃逸，你需要在子应用卸载后将对应全局的副作用清除；

```js
// 主应用工程中，Garfish.run 处设置：
Garfish.run({
  ...,
  apps: [
    { sandbox: false }
  ]
})
```

:::caution
注意，不要设置 Garfish.run() 顶层的 sandbox 属性，这会导致所有子应用的沙箱关闭
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
