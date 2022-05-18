---
title: bridge
slug: /guide/bridge
order: 1
---

import Highlight from '@site/src/components/Highlight';

## 介绍

Garfish bridge 是 `garfish` 提供的帮助用户降低接入成本的工具函数，它能自动提供 `provider` 函数所需的应用生命周期函数 `render` 和 `destory` ，并实现框架不同版本的兼容。封装底层实现，降低接入成本和出错概率。

:::info
1. garfish bridge 应用在子应用接入场景；
2. 使用 garfish bridge 后不再需要显示提供 `render` 和 `destory` 函数；
3. 目前 garfish 仅针对 react 和 vue 框架提供 bridge 函数支持，支持的版本分别为 react v16、v17，vue v2、v3， Angular bridge 及 react v18 正在加紧支持中；
4. garfish bridge 暂未针对构建工具如 webpack、vite 提供相应的构建工具插件，我们后期会针对这块能力进行补全，请持续关注；
:::

## 工具包

### @garfish/bridge

[@garfish/bridge](https://www.npmjs.com/package/@garfish/bridge) 工具包是 garfish 为 react 应用提供的 bridge 工具函数包，其导出的 [reactBridge](/guide/bridge#reactbridge) 可用于 react 子应用的接入，目前支持 react v16、v17，针对 v18 支持我们正在加紧开发中。`@garfish/bridge` 的使用见 [demo](/guide/demo/react#react-v16v17-%E5%AF%BC%E5%87%BA)。

### @garfish/bridge-vue-v2

[@garfish/bridge-vue-v2](https://www.npmjs.com/package/@garfish/bridge-vue-v2) 工具包是 garfish 为 vue v2 应用 提供的 bridge 工具函数包，其导出的 [vueBridge](/guide/bridge#vuebridge) 可用于 vue v2 子应用的接入，`@garfish/bridge-vue-v2` 的使用见 [demo](/guide/demo/vue#vue2-导出)。

### @garfish/bridge-vue-v3

[@garfish/bridge-vue-v3](https://www.npmjs.com/package/@garfish/bridge-vue-v3) 工具包是 garfish 为 vue v3 应用 提供的 bridge 工具函数包，其导出的 [vueBridge](/guide/bridge#vuebridge) 可用于 vue v3 子应用的接入，`@garfish/bridge-vue-v3` 的使用见 [demo](/guide/demo/vue#vue3-导出)。
## 安装

<Tabs>
  <TabItem value="install_react" label="react 应用" default>

  ```bash npm2yarn
  npm install @garfish/bridge --save
  ```
  </TabItem>

 <TabItem value="install_vue2" label="vue2 应用" default>

  ```bash npm2yarn
  npm install @garfish/bridge-vue-v2 --save
  ```
  </TabItem>

  <TabItem value="install_vue3" label="vue3 应用" default>

  ```bash npm2yarn
  npm install @garfish/bridge-vue-v3 --save
  ```
  </TabItem>
</Tabs>



## reactBridge

reactBridge 是 `@garfish/bridge` 工具包为 react 子应用提供的 bridge 工具函数。

### Type

```ts
function reactBridge(userOpts: OptsTypes): (
  appInfo: any,
  props: any,
) => Promise<{
  render: (props: any) => any;
  destroy: (props: any) => any;
  update: (props: any) => any;
}>;
```

### 示例

> 可访问 [react17 子应用](https://github.com/modern-js-dev/garfish/tree/main/dev/app-react-17) 查看完整 demo

```ts
import React from 'react';
import ReactDOM from 'react-dom';
import { reactBridge } from '@garfish/bridge';
import RootComponent from './components/root';
import ErrorComponent from './components/ErrorBoundary';

// 适用于 react v16、v17
export const provider = reactBridge({
  React,
  ReactDOM,
  el: '#root',
  rootComponent: RootComponent,
  loadRootComponent: ({ basename, dom, props }) => {
    // do something...
    return Promise.resolve(() => <RootComponent basename={basename} />);
  },
  errorBoundary: () => <ErrorComponent />,
});
```

### 参数

`OptsTypes`

- <Highlight> React </Highlight>

  - Type: `typeof React`
  - 必传
  - 当前应用使用的 React 对象，可通过 `import React from "react"` 引入，必传。

- <Highlight> ReactDOM </Highlight>

  - Type: `typeof ReactDOM`
  - 必传
  - 当前应用使用的 ReactDOM 对象，可通过 `import ReactDOM from "react-dom"` 引入，必传。

- <Highlight> el </Highlight>

  - Type: `string`
  - 非必传f
  - 子应用挂载点
    - 若子应用构建为 `JS` 入口时，不需要传挂载点，Bridge 将会以子应用的渲染节点作为挂载点；
    - 若子应用构建成 `HTML` 入口时，则直接传入选择器，bridge 内部通过 `dom.querySelector` 来基于子应用的 `dom` 来找到挂载点；

- <Highlight> rootComponent </Highlight>

  - Type：`React.ComponentType`
  - 此参数和 `loadRootComponent` 至少传一个
  - 当前应用的顶层 React 组件，该组件中将接受到 garfish 传递的 appInfo 应用相关参数：
    ```ts
    // components/root.tsx
    const RootComponent = ({ appName, basename, dom, props }) => { ... }
    ```
  - 当同时传入了 `loadRootComponent` 参数时，`rootComponent` 参数将失效，且 `rootComponent` 组件不会默认接收到 garfish 传递的 appInfo 应用相关参数；

- <Highlight> loadRootComponent </Highlight>

  - Type：`loadRootComponentType = (opts: Record<string, any>) => Promise<ComponentType>;`
  - 此参数和 `rootComponent` 至少传一个
  - 当前应用的顶层 React 组件，该组件中将接收到 garfish 传递的 appInfo 应用相关参数：

  ```ts
  // components/root.tsx
  const RootComponent = ({ appName, basename, dom, props }) => { ... }
  ```

  - `loadRootComponent` 是一个函数，返回一个 Promise 对象，resolve 后需要返回当前 React 应用的顶层组件，该顶层组件含义与 `rootComponent` 含义相同。当需要在 render 前进行异步操作时，可使用 `loadRootComponent` 加入副作用逻辑。
  - `loadRootComponent` 将默认接收到 garfish 传递的 appInfo 应用相关参数：

  ```ts
   import { reactBridge } from "@garfish/bridge";
   export const provider = reactBridge({
     ...,
     loadRootComponent: ({ basename, dom, props }) => {
         // do something...
       return Promise.resolve(() => <RootComponent basename={ basename } />);
     }
   });
  ```

  此时，`RootComponent` 接收到的参数取决于此处 `loadRootComponent` 传递的参数。

  - 当同时传入了 `rootComponent` 参数时，`loadRootComponent` 的优先级更高， `rootComponent` 将失效；

- <Highlight> errorBoundary </Highlight>

  - Type：`errorBoundary: (caughtError: boolean, info: string, props: any) => ReactNode | null;`
  - 非必传
  - 设置应用的 errorBoundary 组件，`errorBoundary` 是一个函数，并在子应用发生错误时触发，该函数将传递 error 报错信息及报错相关应用堆栈信息：

  ```ts
   import { reactBridge } from "@garfish/bridge";
   export const provider = reactBridge({
     ...,
     errorBoundary: ( error, info ) => <ErrorComponent />,
   });
  ```

## vueBridge(for vue v2)

:::info
针对 vue v2 子应用，请使用 `@garfish/bridge-vue-v2` 工具包。
:::

vueBridge 是 `@garfish/bridge-vue-v2` 工具包为 vue v2 子应用提供的 bridge 工具函数。

### 类型

```ts
function vueBridge(userOpts: OptsTypes): (
  appInfo: any,
  props: any,
) => Promise<{
  render: (props: any) => any;
  destroy: (props: any) => any;
  update: (props: any) => any;
}>;
```

### 示例

> 可访问 [vue2 子应用](https://github.com/modern-js-dev/garfish/tree/main/dev/app-vue-2) 查看完整 demo

```ts
import { vueBridge } from '@garfish/bridge-vue-v2';
import store from './store';
import App from './App.vue';
import Home from './components/Home.vue';

Vue.use(VueRouter);
Vue.config.productionTip = false;

function newRouter(basename) {
  const router = new VueRouter({
    mode: 'history',
    base: basename,
    routes: [{ path: '/home', component: Home }],
  });
  return router;
}

export const provider = vueBridge({
  rootComponent: App,
  // 可选，注册 vue-router或状态管理对象
  appOptions: ({ basename, dom, appName, props }) => {
    // pass the options to Vue Constructor. check https://vuejs.bootcss.com/api/#%E9%80%89%E9%A1%B9-%E6%95%B0%E6%8D%AE
    return {
      el: '#app',
      router: newRouter(basename),
      store,
    };
  }
});
```
### 参数

`OptsTypes`

- <Highlight> rootComponent </Highlight>

- Type：`vue.Component`
- 非必传。此参数和 `loadRootComponent` 至少传一个
- 当前应用的顶层 Vue 组件，该组件中将接受到 garfish 传递的子应用相关参数：
  ```ts
  // components/root.tsx
  const RootComponent = ({ appName, basename, dom, props, appInfo}) => { ... }
  ```
- 当同时传入了 `loadRootComponent` 参数时，`rootComponent` 将失效，且 `rootComponent` 组件不会默认接受到 garfish 传递的子应用相关参数；

- <Highlight> loadRootComponent </Highlight>

  - Type：`loadRootComponentType = (opts: Record<string, any>) => Promise<ComponentType>;`
  - 非必传。此参数和 `rootComponent` 至少传一个
  - 当前应用的顶层 Vue 组件，该组件中实例的 data 对象中将接收到 garfish 传递的子应用相关参数

  - `loadRootComponent` 是一个函数，返回一个 Promise 对象，resolve 后需要返回当前 Vue 应用的顶层组件，该顶层组件含义与 `rootComponent` 含义相同。当需要在 render 前进行异步操作时，可使用 `loadRootComponent` 加入副作用逻辑。

  - `loadRootComponent` 将默认接收到 garfish 传递的子应用相关参数：

  ```ts
   import { vueBridge } from "@garfish/bridge-vue-v2";
   export const provider = vueBridge({
     ...,
     loadRootComponent: ({ appName, basename, dom, props, appInfo }) => {
       // do something async
       return Promise.resolve(App);
     }
   });
  ```

  - 当同时传入了 `rootComponent` 参数时，`loadRootComponent` 的优先级更高， `rootComponent` 将失效；


- <Highlight> appOptions </Highlight>

  - Type: `appOptions: (opts: Record<string, any>) => Record<string, any> | Record<string, any>`
  - 非必传
  - 作为函数时，接收 garfish 传递的子应用相关参数并返回用来实例化 Vue 应用的对象参数，也可作为对象类型直接返回用来实例化 Vue 应用的对象参数。实例化完成后，garfish 子应用相关参数将会自动注入到组件实例的 `data` 对象中。
  - `appOptions` 参数将直接透传为 Vue 构造函数实例化时的初始化参数 new Vue(appOptions)，此时参数类型与 [vue](https://vuejs.bootcss.com/api/#%E9%80%89%E9%A1%B9-%E6%95%B0%E6%8D%AE) 保持一致。若未传递 `appOptions` 参数，则将自动提供 vue2 应用 `render` 函数用于渲染：`render: (h) => h(opts.rootComponent)`。
  - 若需要指定子应用挂载点，可在此参数中指定：`appOptions: { el: '#app', ...}`，若未指定 `el` 参数，将默认使用全局挂载点。

:::tip
需要注意的是，`appOpitons` 中并不会默认包含路由或状态逻辑的处理，可显示在 `appOpitons` 中传递路由参数信息。
:::

```js
import { vueBridge } from '@garfish/bridge-vue-v2';
export const provider = vueBridge({
  rootComponent: App,
  appOptions: ({ basename, dom, appName, props, appInfo }) => {
    // pass the options to Vue Constructor. check https://vuejs.bootcss.com/api/#%E9%80%89%E9%A1%B9-%E6%95%B0%E6%8D%AE
    return {
      el: '#app',
      router: newRouter(basename),
      store,
    };
  }
});
```

- <Highlight> handleInstance </Highlight>

  - Type: ` handleInstance: (vueInstance: InstanceType<vue.VueConstructor>, opts: optionsType) => void;`
  - 非必传
  - 处理 app 实例对象的函数，接受创建的 app 实例对象及 garfish 子应用相关参数，可自定义处理逻辑如路由注册或状态管理等相关能力。
## vueBridge(for vue v3)

:::info
针对 vue v3 子应用，请使用 `@garfish/bridge-vue-v3` 工具包。
:::

vueBridge 是 `@garfish/bridge-vue-v3` 工具包为 vue v3 子应用提供的 bridge 工具函数。

### 类型

```ts
function vueBridge(userOpts: OptsTypes): (
  appInfo: any,
  props: any,
) => Promise<{
  render: (props: any) => any;
  destroy: (props: any) => any;
  update: (props: any) => any;
}>;
```

### 示例

> 可访问 [vue v3 子应用](https://github.com/modern-js-dev/garfish/tree/main/dev/app-vue-3) 查看完整 demo

```ts
import { createRouter, createWebHistory } from 'vue-router';
import { stateSymbol, createState } from './store.js';
import App from './App.vue';
import Home from './components/Home.vue';
import { vueBridge } from '@garfish/bridge-vue-v3';

function newRouter(basename) {
  const router = createRouter({
    history: createWebHistory(basename),
    routes: [{ path: '/home', component: Home }],
  });
  return router;
}

export const provider = vueBridge({
  rootComponent: App,
  // 可选，注册 vue-router或状态管理对象
  handleInstance: (vueInstance, { basename, dom, appName, props, appIndfo }) => {
    vueInstance.use(newRouter(basename));
    vueInstance.provide(stateSymbol, createState());
  },
});
```

### 参数

`OptsTypes`

- <Highlight> rootComponent </Highlight>

- Type：`vue.Component`
- 非必传。此参数和 `loadRootComponent` 至少传一个
- 当前应用的顶层 Vue 组件，该组件中将接受到 garfish 传递的子应用相关参数：
  ```ts
  // components/root.tsx
  const RootComponent = ({ appName, basename, dom, props, appInfo}) => { ... }
  ```
- 当同时传入了 `loadRootComponent` 参数时，`rootComponent` 将失效，且 `rootComponent` 组件不会默认接受到 garfish 传递的子应用相关参数；

- <Highlight> loadRootComponent </Highlight>

  - Type：`loadRootComponentType = (opts: Record<string, any>) => Promise<ComponentType>;`
  - 非必传。此参数和 `rootComponent` 至少传一个
  - 当前应用的顶层 Vue 组件，该组件中实例的 data 对象中将接收到 garfish 传递的子应用相关参数

  - `loadRootComponent` 是一个函数，返回一个 Promise 对象，resolve 后需要返回当前 Vue 应用的顶层组件，该顶层组件含义与 `rootComponent` 含义相同。当需要在 render 前进行异步操作时，可使用 `loadRootComponent` 加入副作用逻辑。

  - `loadRootComponent` 将默认接收到 garfish 传递的子应用相关参数：

  ```ts
   import { vueBridge } from "@garfish/bridge-vue-v3";
   export const provider = vueBridge({
     ...,
     loadRootComponent: ({ appName, basename, dom, props, appInfo }) => {
       // do something async
       return Promise.resolve(App);
     }
   });
  ```

  - 当同时传入了 `rootComponent` 参数时，`loadRootComponent` 的优先级更高， `rootComponent` 将失效；


- <Highlight> appOptions </Highlight>

  - Type: `appOptions: (opts: Record<string, any>) => Record<string, any> | Record<string, any>`
  - 非必传
  - 作为函数时，接收 garfish 传递的子应用相关参数并返回用来实例化 Vue 应用的对象参数，也可作为对象类型直接返回用来实例化 Vue 应用的对象参数。实例化完成后，garfish 子应用相关参数将会自动注入到组件实例的 `data` 对象中。
  - 在 Vue3 中，`appOptions` 参数将直接透传给 `createApp` 函数调用： `createApp(appOptions)`，此时参数类型与 [createApp](https://vuejs.org/api/application.html#createapp) 保持一致。若未传递 `appOptions` 参数，则将直接调用 `createApp(rootComponent)` 创建根组件。
  - 若需要指定子应用挂载点，可在此参数中指定：`appOptions: { el: '#app', ...}`，若未指定 `el` 参数，将默认使用全局挂载点。

:::tip
需要注意的是，`appOpitons` 中并不会默认包含路由或状态逻辑的处理，可通过 `handleInstance` 函数拿到创建的 vue 实例对象后进行路由注册。
:::

- <Highlight> handleInstance </Highlight>

  - Type: `handleInstance: (vueInstance: vue.App, opts: optionsType) => void;`
  - 非必传
  - 处理 app 实例对象的函数，接受创建的 app 实例对象及 garfish 子应用相关参数，可自定义处理逻辑如路由注册或状态管理等相关能力。

```js
import { vueBridge } from '@garfish/bridge-vue-v3';
export const provider = vueBridge({
  rootComponent: App,
  // 获取 vue 实例并进行路由注册和状态注册
  handleInstance: (vueInstance, { basename, dom, appName, props, appInfo }) => {
    vueInstance.use(newRouter(basename));
    vueInstance.provide(stateSymbol, createState());
  },
});
```
