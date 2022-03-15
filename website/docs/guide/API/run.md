---
title: Garfish.run
slug: /api/run
order: 2
---

`Garfish.run` 方法是用于初始化子应用信息并启动子应用自动渲染流程的 `API`。通过 `run` 方法可以初始化全局配置，并注册子应用信息，包括应用的挂载点、子应用信息列表。`run` 函数中的配置会有一部分在 `registerApp` 和 `loadApp` 中一样，`run` 中的配置是用于初始化全局的默认配置，若 `loadApp`、`registerApp` 中存在和 `Run` 相同的配置将会覆盖全局默认的配置，并且只对特定应用生效

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
    },
  ],

  sandbox: {
    // 关闭快照沙箱使用，vm 沙箱
    snapshot: false,
    // 用来修正子应用的请求的 baseUrl（为了兼容旧版本，默认为 false）
    fixBaseUrl: false,
    // 覆盖子应用的执行上下文，使用自定义的执行上下文，例如子应用 localStorage 使用当前主应用 localStorage
    modules: [
      () => ({
        override: {
          localStorage: window.localStorage,
        },
      }),
    ],
  },

  // global hook
  beforeLoad(appInfo) {
    console.log('子应用开始加载', appInfo.name);
  },

  afterLoad(appInfo) {
    console.log('子应用加载完成', appInfo.name);
  },

  // 提供了该 hook，错误将不会 throw 到文档流中（不会被全局错误监听到），提供给开发者决定如何处理错误
  errorLoadApp(error, appInfo) {
    console.log('子应用加载异常', appInfo.name);
    console.error(error);
  },

  // app hook
  beforeMount(appInfo) {
    console.log('子应用开始渲染', appInfo.name);
  },

  afterMount(appInfo) {
    console.log('子应用渲染结束', appInfo.name);
  },

  // 提供了该 hook，错误将不会 throw 到文档流中（不会被全局错误监听到），提供给开发者决定如何处理错误
  errorMountApp(error, appInfo) {
    console.log('子应用渲染异常', appInfo.name);
    console.error(error);
  },

  beforeUnmount(appInfo) {
    console.log('子应用开始销毁', appInfo.name);
  },

  afterUnmount(appInfo) {
    console.log('子应用销毁结束', appInfo.name);
  },

  // 提供了该 hook，错误将不会 throw 到文档流中（不会被全局错误监听到），提供给开发者决定如何处理错误
  errorUnmountApp(error, appInfo) {
    console.log('子应用销毁异常', appInfo.name);
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
  <dt><strong>sandbox?: SandboxConfig | false（默认值:SandboxConfig ）</strong></dt>
  <dd>
    用于配置子应用沙箱的运行参数，当配置 sandbox 为 false 时表示关闭沙箱，当 sandbox 为对象类型时可以配置以下参数
    <dl className="args-list">
      <dt><strong>snapshot?: false（默认值为 false）</strong></dt>
      <dd>表明是否开启快照沙箱，默认情况下关闭快照沙箱，使用 VM 沙箱（VM 沙箱支持多实例）</dd>
      <dt><strong>fixBaseUrl?: false（默认值为 false）</strong></dt>
      <dd>表明是否修复子应用请求的 baseUrl（请求为相对路径时才生效）</dd>
      <dt><strong>strictIsolation?: false（默认值为 false）</strong></dt>
      <dd>表明是否开启开启严格隔离，开启严格隔离后，子应用的渲染节点将会开启 Shadow DOM close 模式，并且子应用的查询和添加行为仅会在 DOM 作用域内进行</dd>
      <dt><strong>modules?: Module[]（默认值: []）</strong></dt>
      <dd>
        用于覆盖子应用执行上下文的环境变量，仅在 snapshot: false 时有效
      </dd>
    </dl>
  </dd>
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
