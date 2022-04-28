---
title: bridge
slug: /guide/bridge
order: 1
---

## 介绍

Garfish bridge 是 `garfish` 提供的帮助用户降低接入成本的工具函数，它能自动提供 `provider` 函数所需的应用生命周期函数 `render` 和 `destory` ，并实现框架不同版本的兼容。封装底层实现，降低接入成本和出错概率。

:::info

1. garfish bridge 应用在子应用接入场景；
2. 使用 garfish bridge 后不再需要显示提供 `render` 和 `destory` 函数；
3. 目前 garfish 仅针对 react 和 vue 框架提供 bridge 函数支持，支持的版本分别为 react v16、v17，vue v2、v3， Angular bridge 及 react v18 正在加紧支持中；
4. garfish bridge 暂未针对构建工具如 webpack、vite 提供相应的构建工具插件，我们后期会针对这块能力进行补全，请持续关注；
:::

## @garfish/bridge

@garfish/bridge 是 garfish bridge 功能使用的工具包，封装了 react 应用和 vue 应用 bridge 工具函数 [reactBridge](/guide/bridge#reactbridge) 和 [vueBridge](/guide/bridge#vuebridge)。

## 安装

```bash npm2yarn
npm install @garfish/bridge --save
```

## reactBridge

reactBridge 为 react 应用的 bridge 工具函数。

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

- <Highlight>  ReactDOM </Highlight>

  - Type: `typeof ReactDOM`
  - 必传
  - 当前应用使用的 ReactDOM 对象，可通过 `import ReactDOM from "react-dom"` 引入，必传。

- <Highlight>  el </Highlight>

  - Type: `string`
  - 非必传
  - 子应用挂载点，作用类似于子应用的 [domGetter](/api/registerApp#domgetter) 参数，若不传默认使用全局挂载点。

- <Highlight>  rootComponent </Highlight>

  - Type：`React.ComponentType`
  - 此参数和 `loadRootComponent` 至少传一个
  - 当前应用的顶层 React 组件，该组件中将接受到 garfish 传递的 appInfo 应用相关参数：
    ```ts
    // components/root.tsx
    const RootComponent = ({ appName, basename, dom, props }) => { ... }
    ```
  - 当同时传入了 `loadRootComponent` 参数时，`rootComponent` 参数将失效，且 `rootComponent` 组件不会默认接收到 garfish 传递的 appInfo 应用相关参数；

- <Highlight>  loadRootComponent </Highlight>

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

- <Highlight>  errorBoundary </Highlight>

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

## vueBridge

vueBridge 为 vue 应用的 bridge 工具函数。

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

> 可访问 [vue2 子应用](https://github.com/modern-js-dev/garfish/tree/main/dev/app-vue-2) 、[vue3 子应用](https://github.com/modern-js-dev/garfish/tree/main/dev/app-vue-3) 查看完整 demo

<Tabs>
  <TabItem value="vue2" label="vue2" default>

```ts
import Vue from 'vue';
import VueRouter from 'vue-router';
import store from './store';
import App from './App.vue';
import Home from './components/Home.vue';
import { vueBridge } from '@garfish/bridge';

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
  Vue,
  rootComponent: App,
  loadRootComponent: ({ basename, dom, appName, props }) => {
    // do domething...
    return Promise.resolve(App);
  },
  appOptions: ({ basename, dom, appName, props }) => {
    return {
      el: '#app',
      router: newRouter(basename),
      store,
    };
  },
  handleInstance: (vueInstance, { basename, dom, appName, props }) => {
    console.log(vueInstance, basename, dom, appName, props);
  },
});
```

  </TabItem>
  <TabItem value="vue3" label="vue3" default>

```ts
import { h, createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { stateSymbol, createState } from './store.js';
import App from './App.vue';
import Home from './components/Home.vue';
import { vueBridge } from '@garfish/bridge';

function newRouter(basename) {
  const router = createRouter({
    history: createWebHistory(basename),
    routes: [{ path: '/home', component: Home }],
  });
  return router;
}

export const provider = vueBridge({
  createApp,
  rootComponent: App,
  loadRootComponent: ({ basename, dom, appName, props }) => {
    // do domething...
    return Promise.resolve(App);
  },
  appOptions: ({ basename, dom, appName, props }) => {
    return {
      el: '#app',
      render: () => h(App),
    };
  },
  handleInstance: (vueInstance, { basename, dom, appName, props }) => {
    vueInstance.use(newRouter(basename));
    vueInstance.provide(stateSymbol, createState());
  },
});
```

  </TabItem>
</Tabs>

### 参数

`OptsTypes`

- <Highlight> Vue </Highlight>

  - Type: `Vue.VueConstructor`
  - **当前应用是 vue2 应用时**，必传。
  - 当前应用使用的 Vue 对象，可通过 `import Vue from "vue"` 引入

- <Highlight> createApp </Highlight>

  - Type: `Vue.CreateAppFunction<Element>;`
  - **当前应用是 vue3 应用时**，必传。
  - 当前应用使用的 Vue 对象的 `createApp` 属性，可通过 `import { createApp } from "vue"` 引入

- <Highlight>  rootComponent </Highlight>

- Type：`vue.Component`
- 此参数和 `loadRootComponent` 至少传一个
- 当前应用的顶层 Vue 组件，该组件中将接受到 garfish 传递的 appInfo 应用相关参数：
  ```ts
  // components/root.tsx
  const RootComponent = ({ appName, basename, dom, props }) => { ... }
  ```
- 当同时传入了 `loadRootComponent` 参数时，`rootComponent` 将失效，且 `rootComponent` 组件不会默认接受到 garfish 传递的 appInfo 应用相关参数；

- <Highlight>  loadRootComponent </Highlight>

  - Type：`loadRootComponentType = (opts: Record<string, any>) => Promise<ComponentType>;`
  - 此参数和 `rootComponent` 至少传一个
  - 当前应用的顶层 Vue 组件，该组件中实例的 data 对象中将接收到 garfish 传递的 appInfo 应用相关参数

- `loadRootComponent` 是一个函数，返回一个 Promise 对象，resolve 后需要返回当前 Vue 应用的顶层组件，该顶层组件含义与 `rootComponent` 含义相同。当需要在 render 前进行异步操作时，可使用 `loadRootComponent` 加入副作用逻辑。

  - `loadRootComponent` 将默认接收到 garfish 传递的 appInfo 应用相关参数：

  ```ts
   import { vueBridge } from "@garfish/bridge";
   export const provider = vueBridge({
     ...,
     loadRootComponent: ({ basename, dom, props }) => {
       // do something...
       return Promise.resolve(App);
     }
   });
  ```

  - 当同时传入了 `rootComponent` 参数时，`loadRootComponent` 的优先级更高， `rootComponent` 将失效；

- <Highlight> appOptions </Highlight>

  - Type: `appOptions: (opts: Record<string, any>) => Record<string, any> | Record<string, any>`
  - 非必传
  - 作为函数时，接收 garfish 传递的 appInfo 应用相关参数并返回用来实例化 Vue 应用的对象参数，也可作为对象类型直接返回用来实例化 Vue 应用的对象参数。实例化完成后，garfish appInfo 应用相关参数将会自动注入到组件实例的 `data` 对象中。
  - 在 Vue3 中，`appOptions` 参数将直接透传给 `createApp` 函数调用： `createApp(appOptions)`。若未传递 `appOptions` 参数，则将直接调用 `createApp(rootComponent)` 创建根组件。
  - 在 Vue2 中，`appOptions` 参数将直接透传为 Vue 构造函数实例化时的初始化参数 new Vue(appOptions)。若未传递 `appOptions` 参数，则将自动提供 vue2 应用 `render` 函数用于渲染：`render: (h) => h(opts.rootComponent)`。
  - 若需要指定子应用挂载点，可在此参数中指定：`appOptions: { el: '#app', ...}`，若未指定 `el` 参数，将默认使用全局挂载点。

:::tip
需要注意的是，`appOpitons` 中并不会默认包含路由逻辑的处理：

1. 在 vue3 中，可通过 `handleInstance` 函数拿到创建的 vue 实例对象后进行路由注册；
2. 在 vue2 中，可显示在 `appOpitons` 中传递路由参数信息；
:::

- <Highlight> handleInstance </Highlight>

  - Type: `handleInstance: (vueInstance: vue.App, opts: Record<string, any>) => void;`
  - 非必传
  - 处理 app 实例对象的函数，接受创建的 app 实例对象及 garfish appInfo 应用相关参数，可自定义处理逻辑如路由注册等相关能力。
