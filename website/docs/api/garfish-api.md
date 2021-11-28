---
title: Garfish API
slug: /api/garfish
order: 2
---

Garfish 是 `garfish` 默认导出的实例（字节内部用户可使用 `@byted/garfish` 包）， Garfish 主要的 API 都在 Garfish 实例上，通过 Garfish 的 run 方法可以注册应用和启动应用自动挂载渲染流程。

## registerApp

registerApp 是用于注册应用的 API，通过 registerApp 可以动态注册 App，可以一次性注册但一个应用也可以一次性注册多个应用

### 案例参数

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

<dl className="args-list">
  <dt><strong>name: string</strong></dt>
  <dd>子应用的名称，也是子应用的的唯一 id，子应用的的 name 需要互不相同</dd>
  <dt><strong>basename?: string</strong></dt>
  <dd>子应用的基础路径，默认值为 <code>/</code>，子应用的激活路径</dd>
  <dt><strong>entry: string</strong></dt>
  <dd>子应用的入口资源地址，可以为 HTML 子应用入口地址，也可以为JS 子应用入口地址</dd>
  <dt><strong>props?: Object</strong></dt>
  <dd>传递给子应用的参数，子应用的生命周期将接受到该参数</dd>
  <dt><strong>activeWhen: string | (path: string)=> boolean</strong></dt>
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
      <dt><code>activeWhen: (path)=> path.startsWith('/vue-app')</code></dt>
      <dd>✅ https://demo.app/vue-app</dd>
      <dd>✅ https://demo.app/vue-app2</dd>
      <dd>✅ https://demo.app/vue-app/about</dd>
      <dd>✅ https://demo.app/vue-app/detail/goods</dd>
      <dd>🚫 https://demo.app/react-app</dd>
    </dl>
  </dd>
</dl>
