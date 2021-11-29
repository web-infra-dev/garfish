---
title: Garfish API
slug: /api/garfish
order: 2
---

Garfish 是 `garfish` 默认导出的实例（字节内部用户可使用 `@byted/garfish` 包）， Garfish 主要的 API 都在 Garfish 实例上。

## run

`run` 方法是用于初始化子应用信息并启动子应用自动渲染流程的 `API`。通过 `run` 方法可以初始化全局配置，并注册子应用信息，包括应用的挂载点、子应用信息列表。`run` 函数中的配置会有一部分在 `registerApp` 和 `loadApp` 中一样，`run` 中的配置是用于初始化全局的默认配置，若 `loadApp`、`registerApp` 中存在和 `Run` 相同的配置将会覆盖全局默认的配置，并且只对特定应用生效

### 示例

```js
import Garfish from 'garfish';

Garfish.run({
  basename: '/',
  domGetter: '#subApp',
  disablePreloadApp: false,
  apps: [
    {
      name: 'react',
      activeWhen: '/react',
      entry: 'http://localhost:3000',
    },
    {
      name: 'vue',
      activeWhen: '/vue-app',
      domGetter: '#sub-container', // 提供不同的挂载点，react 应用使用全局的 domGetter 挂载点
      entry: 'http://localhost:4000',
    }
  ],
  // global hook
  beforeLoad(appInfo) {
    console.log('子应用开始加载',appInfo.name);
  },
  afterLoad(appInfo) {
    console.log('子应用加载完成',appInfo.name);
  },
  // 提供了该 hook，错误将不会 throw 到文档流中（不会被全局错误监听到），提供给开发者决定如何处理错误
  errorLoadApp(error,appInfo) {
    console.log('子应用加载异常',appInfo.name);
    console.error(error);
  },
  // app hook
  beforeMount(appInfo) {
    console.log('子应用开始渲染',appInfo.name);
  },
  afterMount(appInfo) {
    console.log('子应用渲染结束',appInfo.name);
  },
  // 提供了该 hook，错误将不会 throw 到文档流中（不会被全局错误监听到），提供给开发者决定如何处理错误
  errorMountApp(error,appInfo) {
    console.log('子应用渲染异常',appInfo.name);
    console.error(error);
  }
  beforeUnmount(appInfo) {
    console.log('子应用开始销毁',appInfo.name);
  },
  afterUnmount(appInfo) {
    console.log('子应用销毁结束',appInfo.name);
  },
  // 提供了该 hook，错误将不会 throw 到文档流中（不会被全局错误监听到），提供给开发者决定如何处理错误
  errorUnmountApp(error,appInfo) {
    console.log('子应用销毁异常',appInfo.name);
    console.error(error);
  },
});
```

### 参数

`Options`

<dl className="args-list">
  <dt><strong>domGetter?: string | () => Element</strong></dt>
  <dd>
    子应用的挂载点，提供 string 类型时需要其值是 <code>selector</code>，Garfish 内部会使用 <code>document.querySelector(domGetter)</code> 去选中子应用的挂载点。当提供函数时，子应用在路由驱动挂载和手动挂载时将会执行该函数并且期望返回一个 dom 元素。设置后该值为所有子应用的默认值，若子应用 AppInfo 中也提供了该值会替换全局的 domGetter
  </dd>
  <dt><strong>basename?: string（默认值：/）</strong></dt>
  <dd>子应用的基础路径，默认值为 <code>/</code>，整个微前端应用的 basename。设置后该值为所有子应用的默认值，若子应用 AppInfo 中也提供了该值会替换全局的 basename 值</dd>
  <dt><strong>disablePreloadApp: boolean（默认值：false）</strong></dt>
  <dd>是否禁用子应用的资源预加载，默认开启子应用的预加载能力，预加载能力在弱网情况和手机端将不会开启。预加载加载权重会根据子应用的加载次数，预加载会在用户端计算子应用打开的次数，会优先加载打开次数多的子应用</dd>
  <dt><strong>props?: Object</strong></dt>
  <dd>传递给子应用的参数，子应用的生命周期将接收到该参数</dd>
  <dt><strong>autoRefreshApp?: boolean（默认：true）</strong></dt>
  <dd>主应用在已经打开子应用页面的前提下，跳转子应用的子路由触发子应用的视图更新，在某些场景下通过主应用触发子应用视图更新可能会导致触发子应用的视图刷新而触发子应用的 hook，所以提供关闭触发子应用视图刷新的能力</dd>
  <dt><strong>protectVariable?: string[]</strong></dt>
  <dd>使某些全局变量处于保护状态，值的读写不会受到沙箱的影响（默认情况，子应用的 window 环境变量值是与主应用和其他子应用是隔离的，如果想主应用提供的值在子应用中也能读到或子应用间的值能进行共享，将该值的 key 放置数组中即可实现值间进行共享）</dd>
  <dt><strong>apps?: [appInfo]（<a href="#registerapp">与 registerApp 数组参数一致</a>） </strong></dt>
  <dd>子应用列表</dd>
  <dt><strong>beforeLoad?: async (appInfo: AppInfo)=> false | undefined</strong></dt>
  <dd>开始加载子应用前触发该函数，支持异步函数，可以在该函数中执行异步操作，当返回 false 时表示中断子应用的加载以及后续流程，所有子应用加载都会触发该函数的调用</dd>
  <dt><strong>afterLoad?: async (appInfo: AppInfo)=> void</strong></dt>
  <dd>加载子应用结束后触发该函数，支持异步函数，可以在该函数中执行异步操作，所有子应用加载完成后都会触发该函数的调用</dd>
  <dt><strong>errorLoadApp?: (error: Error, appInfo: AppInfo)=> void</strong></dt>
  <dd>加载异常触发该函数的调用，填写该函数之后错误将不会向上丢出全局无法捕获，所有子应用加载失败后都会触发该函数的调用</dd>
  <dt><strong>beforeMount?: (appInfo: AppInfo)=> void</strong></dt>
  <dd>在子应用渲染前触发该函数</dd>
  <dt><strong>afterMount?: (appInfo: AppInfo)=> void</strong></dt>
  <dd>在子应用渲染后触发该函数</dd>
  <dt><strong>errorMountApp?: (error: Error, appInfo: AppInfo)=> void</strong></dt>
  <dd>渲染异常触发该函数的调用，填写该函数之后错误将不会向上丢出全局无法捕获，所有子应用加载失败后都会触发该函数的调用</dd>
  <dt><strong>beforeUnmount?: (appInfo: AppInfo)=> void</strong></dt>
  <dd>在子应用销毁前触发该函数</dd>
  <dt><strong>afterUnmount?: (appInfo: AppInfo)=> void</strong></dt>
  <dd>在子应用销毁后触发该函数</dd>
  <dt><strong>errorUnmountApp?: (error: Error, appInfo: AppInfo)=> void</strong></dt>
  <dd>销毁异常触发该函数的调用，填写该函数之后错误将不会向上丢出全局无法捕获，所有子应用加载失败后都会触发该函数的调用</dd>
  <dt><strong>onNotMatchRouter?: (path: string)=> void</strong></dt>
  <dd>在路由发生变化时并且未匹配到任何子应用时触发</dd>
</dl>

## registerApp

`registerApp` 是用于注册子应用的 API，通过 `registerApp` 可以动态注册子应用信息，可以注册单个子应用也可以一次性注册多个子应用。也可以使用 `run` 方法注册应用并初始化应用配置，在 `run` 方法中的使用 `apps` 参数提供子应用信息列表，`apps` 参数在底层就是使用 `registerApp` 传递数组的方式注册多个子应用的。

### 示例

```js
import Garfish from 'garfish';

Garfish.registerApp({
  name: 'vue-app',
  basename: '/demo',
  entry: 'http://localhost:3000',
  activeWhen: '/vue-app',
  props: {
    msg: 'vue-app msg',
  },
});

// 也可以通过传入一个数组，一次注册多个 app
Garfish.registerApp([
  {
    name: 'vue-app',
    entry: 'http://localhost:3000',
    activeWhen: '/vue-app',
  },
  {
    name: 'react-app',
    entry: 'http://localhost:2000',
    activeWhen: '/react-app',
  },
]);
```

### 参数

`AppInfo | Array<AppInfo>`

<dl className="args-list">
  <dt><strong>name: string</strong></dt>
  <dd>子应用的名称，也是子应用的的唯一 id，子应用的的 name 需要互不相同</dd>
  <dt><strong>basename?: string</strong></dt>
  <dd>子应用的基础路径，默认值为 <code>/</code>，子应用的激活路径</dd>
  <dt><strong>entry: string</strong></dt>
  <dd>子应用的入口资源地址，可以为 HTML 子应用入口地址，也可以为JS 子应用入口地址</dd>
  <dt><strong>domGetter?: string | () => Element</strong></dt>
  <dd>子应用的挂载点，提供 string 类型时需要其值是 `cssSelector`，Garfish 内部会使用 `document.querySelector(domGetter)` 去选中子应用的挂载点。当提供函数时，子应用在路由驱动挂载和手动挂载时将会执行该函数并且期望返回一个 dom 元素 </dd>
  <dt><strong>props?: Object</strong></dt>
  <dd>传递给子应用的参数，子应用的生命周期将接受到该参数</dd>
  <dt><strong>activeWhen?: string | (path: string)=> boolean</strong></dt>
  <dd>
    子应用的激活条件，可以为 string 类型和函数类型。
    为 string 类型时填写子应用的一级路由，该值将会受到 basename 的影响，实际子应用激活的路径为 basename + activeWhen。
    为函数时在函数内判断参数 <code>path</code> 是否为符合子应用的激活条件，若返回 <code>true</code> 则满足子应用的激活条件，不会受到 basename 的影响<br/>
    <dl>
      <dt><code>activeWhen: '/vue-app',（basename:'/'）</code></dt>
      <dd>✅ https://demo.app/vue-app</dd>
      <dd>✅ https://demo.app/vue-app/about</dd>
      <dd>✅ https://demo.app/vue-app/detail/goods</dd>
      <dd>🚫 https://demo.app/vue-app2</dd>
      <dd>🚫 https://demo.app/react-app</dd>
    </dl>
    <dl>
      <dt><code>activeWhen: '/vue-app',（basename:'/demo'）</code></dt>
      <dd>✅ https://demo.app/demo/vue-app</dd>
      <dd>✅ https://demo.app/demo/vue-app/about</dd>
      <dd>🚫 https://demo.app/vue-app</dd>
      <dd>🚫 https://demo.app/vue-app/detail/goods</dd>
      <dd>🚫 https://demo.app/react-app</dd>
    </dl>
    为函数时在函数内判断参数 <code>path</code> 是否为符合子应用的激活条件，若返回 <code>true</code> 则满足子应用的激活条件
    <dl>
      <dt><code>activeWhen: (path)=> path.startsWith('/vue-app') || path.startsWith('/sub-app') </code></dt>
      <dd>✅ https://demo.app/vue-app</dd>
      <dd>✅ https://demo.app/sub-app</dd>
      <dd>✅ https://demo.app/vue-app2</dd>
      <dd>✅ https://demo.app/vue-app/about</dd>
      <dd>✅ https://demo.app/sub-app/about</dd>
      <dd>✅ https://demo.app/vue-app/detail/goods</dd>
      <dd>🚫 https://demo.app/react-app</dd>
    </dl>
  </dd>
</dl>

## loadApp

与 `run` 函数不同，run 方法是在执行后，当路由发生变化时会自动的匹配符合条件的应用执行渲染和销毁逻辑，`loadApp` 提供了更加灵活的加载微前端应用模式，通过 `loadApp` API 可以手动控制子应用的渲染预销毁

### 示例

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="framework">
  <TabItem value="React" label="React" default>

```jsx
import React from 'react';
import Garfish from 'garfish';
import { BrowserRouter, Route, Link, Switch } from 'react-router-dom';

function VueApp(basename) {
  useEffect(async () => {
    let app = await Garfish.loadApp('vue-app', {
      entry: 'http://localhost:8092',
      basename,
      cache: true,
    });
    // 若已经渲染触发 show，只有首次渲染触发 mount，后面渲染都可以触发 show 提供性能
    app.mounted ? app.mount() : app.show();
    return () => app.hide();
  });
  return <div id="container"></div>;
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
<template>
  <div>
    <div id="container"></div>
  </div>
</template>

<script>
  import Garfish 'garfish';
  let appInstance = null;
  export default {
    name: 'App',
    async mounted () {
      appInstance = await Garfish.loadApp('react-app',{
        entry: 'http://localhost:8093',
        basename: '/react-app',
        cache: true
      });
      // 若已经渲染触发 show，只有首次渲染触发 mount，后面渲染都可以触发 show 提供性能
      appInstance.mounted? appInstance.mount() : appInstance.show();
    },
    destroyed () {
      appInstance.hide();
    }
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

### 参数

<dl className="args-list">
  <dt><strong>name: string</strong></dt>
  <dd>子应用的名称，也是子应用的的唯一 id，若 name 的应用已经通过 run、setOptions 注册过，提供 name 时将直接获取应用的信息</dd>
  <dt><strong>Options: AppInfo</strong></dt>
  <dl className="args-list">
    <dt><strong>basename?: string（默认值: /）</strong></dt>
    <dd>子应用的基础路径，子应用所有的路由都在此基础上</dd>
    <dt><strong>entry: string</strong></dt>
    <dd>子应用的入口资源地址，可以为 HTML 子应用入口地址，也可以为JS 子应用入口地址</dd>
    <dt><strong>domGetter?: string | () => Element</strong></dt>
    <dd>子应用的挂载点，提供 string 类型时需要其值是 `cssSelector`，Garfish 内部会使用 `document.querySelector(domGetter)` 去选中子应用的挂载点。当提供函数时，子应用在路由驱动挂载和手动挂载时将会执行该函数并且期望返回一个 dom 元素 </dd>
    <dt><strong>cache?: boolean（默认值: true）</strong></dt>
    <dd>在调用 loadApp 时若已经加载过应用实例将返回相同的应用实例</dd>
    <dt><strong>props?: Object</strong></dt>
    <dd>传递给子应用的参数，子应用的生命周期将接受到该参数</dd>
  </dl>
</dl>

### 返回值

`AppInstance`

<dl className="args-list">
  <dt><strong>mounted: boolean</strong></dt>
  <dd>是否已经触发 mount 渲染函数</dd>
  <dt><strong>mount: Function</strong></dt>
  <dd>触发子应用的渲染流程：创建子应用的渲染容器、创建一个子应用的执行环境、执行子应用的所有代码、执行 provider 提供的子应用 render 函数</dd>
  <dt><strong>show: Function</strong></dt>
  <dd>触发子应用的显示流程：显示子应用的渲染容器、执行子应用的 render 函数（不会创建新的执行上下文）</dd>
  <dt><strong>unmount: Function</strong></dt>
  <dd>触发子应用的销毁流程：移除子应用的渲染容器、销毁子应用的执行上下文、子应用在渲染过程中产生的副作用都会被清除、执行 provider 提供的子应用 destroy 函数</dd>
  <dt><strong>hide: Function</strong></dt>
  <dd>触发子应用的隐藏流程：隐藏子应用的渲染容器、执行 provider 提供的子应用 destroy 函数</dd>
</dl>

## setOptions

`setOptions` 是用于动态更新应用配置的 `API`，`setOptions` 的值与 `run` 的参数一致，为了保证应用参数在运行过程中混乱不一致的情况，在触发了 `run` 方法后，不可以再通过 `setOptions` 更改应用配置

### 示例

```js
// 主应用 index.js
import Garfish from 'garfish';

Garfish.setOptions({
  basename: '/',
  domGetter: '#container',
  // xxx
});
```

### 参数

`Options`

<a href="#run">与 run 参数一致</a>

## channel

`channel` 用于应用间的通信。它是 [EventEmitter2](https://github.com/EventEmitter2/EventEmitter2) 的实例

### 示例

```js
// 子应用监听登录事件
const App = () => {
  const handleLogin = (userInfo) => {
    console.log(`${userInfo.name} has login`);
  };

  useEffect(() => {
    window?.Garfish.channel.on('login', handleLogin);
    return () => {
      window?.Garfish.channel.removeListener('login', handleLogin);
    };
  });
};

// 主应用触发监听事件
api.getLoginInfo.then((res) => {
  if (res.code === 0) {
    window.Garfish.channel.emit('login', res.data);
  }
});
```

## setExternal

`setExternal` 用于实现应用间的依赖共享，通过该函数将依赖进行注册，注册完成后可以实现主子应用的依赖共享，但可能会由于共享带来某些依赖的影响，若出现问题建议关闭共享。

### 示例

> 主应用

```js
// 主应用 webpack 配置
module.exports = {
  output: {
    // 需要配置成 umd 规范
    libraryTarget: 'umd',
    // 请求确保该值与子应用的值不相同避免与子应用发生影响
    jsonpFunction: 'main-app-jsonpFunction',
  },
};

// 主应用 index.js
import Vue from 'vue';
import Garfish from 'garfish';

Garfish.setExternal('vue', Vue);
```

> 子应用

```js
// 主应用 webpack 配置
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
  externals: {
    vue: 'vue',
  },
};
```

## getGlobalObject

用于获取真实 window 的值在 `Garfish` 默认启动了沙箱的隔离能力，所以在子应用中全局变量默认是隔离的，通过该方法可以读取真实 window 的值。一般情况下并不建议用户直接使用该 API，若子应用要获取真实的 window 上的环境变量，可考虑将其加入 `protectVariable` 列表中

### 示例

```js
import Garfish from 'garfish';

const nativeWindow = Garfish.getGlobalObject();
```

## setGlobalValue

用于设置真实 window 的值在 `Garfish` 中默认启动了沙箱的隔离能力，所以在子应用中全局变量默认是隔离的，通过该方法可以读取真实 window 的值。一般情况下并不建议用户直接使用该 API，若子应用要获取真实的 window 上的环境变量，可考虑将其加入 `protectVariable` 列表中

### 示例

```js
import Garfish from 'garfish';

Garfish.setGlobalValue(key: string | symbol, value: any)
```

## clearEscapeEffect

若发现有一些特殊的行为会逃逸沙箱系统，可以使用此方法来清除逃逸的变量

### 示例

```js
Garfish.clearEscapeEffect('webpackJsonp');
```
