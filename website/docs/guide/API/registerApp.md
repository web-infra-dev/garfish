---
title: Garfish.registerApp
slug: /api/registerApp
order: 3
---

`Garfish.registerApp` 是用于注册子应用的 API，通过 `registerApp` 可以动态注册子应用信息，可以注册单个子应用也可以一次性注册多个子应用。也可以使用 `run` 方法注册应用并初始化应用配置，在 `run` 方法中的使用 `apps` 参数提供子应用信息列表，`apps` 参数在底层就是使用 `registerApp` 传递数组的方式注册多个子应用的。

### 示例

```js
import Garfish from 'garfish';

Garfish.registerApp({
  name: 'vue-app',
  basename: '/demo',
  activeWhen: '/vue-app',
  entry: 'http://localhost:3000',
  props: {
    msg: 'vue-app msg',
  },
});

// 也可以通过传入一个数组，一次注册多个 app
Garfish.registerApp([
  {
    name: 'vue-app',
    activeWhen: '/vue-app',
    entry: 'http://localhost:3000',
  },
  {
    name: 'react-app',
    activeWhen: '/react-app',
    entry: 'http://localhost:2000',
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
  <dd>
    用于配置子应用沙箱的运行参数，当配置 sandbox 为 false 时表示关闭沙箱，当 sandbox 为对象类型时可以配置以下参数
    <dl className="args-list">
      <dt><strong>snapshot?: false（默认值为 false）</strong></dt>
      <dd>表明是否开启快照沙箱，默认情况下关闭快照沙箱，使用 VM 沙箱（VM 沙箱支持多实例）</dd>
      <dt><strong>strictIsolation?: false（默认值为 false）</strong></dt>
      <dd>表明是否开启开启严格隔离，开启严格隔离后，子应用的渲染节点将会开启 Shadow DOM close 模式，并且子应用的查询和添加行为仅会在 DOM 作用域内进行</dd>
      <dt><strong>modules?: Module[]（默认值: []）</strong></dt>
      <dd>
        用于覆盖子应用执行上下文的环境变量，仅在 snapshot: false 时有效
      </dd>
    </dl>
  </dd>
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
