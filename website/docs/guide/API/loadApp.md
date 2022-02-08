---
title: Garfish.loadApp
slug: /api/loadApp
order: 4
---

与 `Garfish.run` 函数不同，run 方法是在执行后，当路由发生变化时会自动的匹配符合条件的应用执行渲染和销毁逻辑，`Garfish.loadApp` 提供了更加灵活的加载微前端应用模式，通过 `Garfish.loadApp` API 可以手动控制子应用的渲染预销毁

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
      domGetter: '#container',
      basename,
      cache: true,
    });
    // 若已经渲染触发 show，只有首次渲染触发 mount，后面渲染都可以触发 show 提供性能
    app.mounted ? app.show() : await app.mount();
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
  import Garfish from 'garfish';
  let appInstance = null;
  export default {
    name: 'App',
    async mounted () {
      appInstance = await Garfish.loadApp('react-app',{
        entry: 'http://localhost:8093',
        domGetter: '#container',
        basename: '/react-app',
        cache: true
      });
      // 若已经渲染触发 show，只有首次渲染触发 mount，后面渲染都可以触发 show 提供性能
      appInstance.mounted? appInstance.show() : await appInstance.mount();
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

### 不需要缓存的手动加载方案：

```js
// options 是可选的，如果不传，默认会从 Garfish.options 上深拷贝一份过来
const app = await Garfish.loadApp('appName', {
  domGetter: () => document.getElementById('id'),
});

// 渲染：编译子应用的代码 -> 创建应用容器 -> 调用 provider.render 渲染
// 注意：由于沙箱的实现，相同应用重复渲染，可能会导致内存泄漏问题
const success = await app.mount();
// 卸载：清除子应用的副作用 -> 调用 provider.destroy -> 销毁应用容器
const success = await app.unmount();
```

### 需要缓存的手动加载方案（推荐使用缓存）

```js
const cache = true;
const app = await Garfish.loadApp('appName', {
  domGetter: () => document.getElementById('id'),
});

// 渲染
if (cache && app.mounted) {
  const success = app.show();
} else {
  const success = await app.mount();
}
// 卸载
const success = app.hide();
```

### app.mount 做了哪些事情

1. 创建 `app` 容器并添加到文档流上
2. 编译子应用的代码
3. 拿到子应用的 `provider`
4. 调用 `app.options.beforeMount` 钩子
5. 调用 `provider.render`
6. 将 `app.display` 和 `app.mounted` 设置为 `true`
7. 将 `app` set 到 `Garfish.activeApps` 中
8. 调用 `app.options.afterMount` 钩子
   > 如果渲染失败，`app.mount` 会返回 `false`，否则渲染成功会返回 `true`，你可以根据返回值做对应的处理。

### app.unmount 做了哪些事件

1. 调用 `app.options.beforeUnmount` 钩子
2. 调用 `provider.destroy`
3. 清除编译的副作用
4. 将 `app` 的容器从文档流上移除
5. 将 `app.display` 和 `app.mounted` 设置为 `false`
6. 在 `Garfish.activeApps` 中移除当前的 `app` 实例
7. 调用 `app.options.afterUnmount` 钩子
   > 同上，可以根据返回值来判断是否卸载成功。

### app.show 做了哪些事件

1. 将 `app` 的容器添加到文档流上
2. 调用 `provider.render`
3. 将 `app.display` 设置为 `true`
   > 同上，可以根据返回值来判断是否渲染成功。

### app.hide 做了哪些事件

1. 调用 `provider.destroy`
2. 将 `app` 的容器从文档流上移除
3. 将 `app.display` 设置为 `false`
   > 同上，可以根据返回值来判断是否隐藏成功。

### 缓存

手动加载提供的了 `cache` 功能，以便复用 `app`，避免重复的编译代码造成的性能浪费，在 `Garfish.loadApp` 时，传入 `cache` 参数就可以。

 例如下面的代码：

```js
const app1 = await Garfish.loadApp('appName', {
  cache: true,
});

const app2 = await Garfish.loadApp('appName', {
  cache: true,
});

console.log(app1 === app2); // true
```

实际上，对于加载的 `promise` 也会是同一份，例如下面的 demo

```js
const promise1 = Garfish.loadApp('appName', {
  cache: true,
});

const promise2 = Garfish.loadApp('appName', {
  cache: true,
});

console.log(promise1 === promise2); // true

const app1 = await promise1;
const app2 = await promise2;
console.log(app1 === app2); // true
```
