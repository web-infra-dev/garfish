---
title: Garfish.run
slug: /api/run
order: 2
---

用于初始化全局配置、注册子应用信息，并启动子应用自动渲染流程。

## 类型

```ts
run(options?: interfaces.Options): Garfish;
```

```ts
// type 定义
export interface Options extends Config, AppGlobalConfig, GlobalLifecycle {}
```

## 默认值

- {}

## 示例

```ts
import Garfish from "garfish";
import type { interfaces } from "garfish";

const config: interfaces.Options = {
    /* global options */
    basename: '/',
    domGetter: '#subApp',
    disablePreloadApp: false,
    ...
    /* app infos */
    apps: [
      {
        name: 'react',
        activeWhen: '/react',
        entry: 'http://localhost:3000',
        ...
      }
    ],
    /* lifecycle hooks */
    beforeLoad(appInfo) {
      console.log('子应用开始加载', appInfo.name);
    },
    afterLoad(appInfo) {
      console.log('子应用加载完成', appInfo.name);
    },
    ...
}
Garfish.run({ config });
```

## 参数

`options`

### domGetter?

- Type: <span style={{color: '#ff5874', display: 'inline-block', margin: '4px 6px'}}> interfaces.DomGetter </span>

```ts
export type DomGetter =
  | string
  | (() => Element | null)
  | (() => Promise<Element>);
```

- 子应用的默认挂载点，可选，没有默认值，若省略需要在子应用 AppInfo 中单独指定。二者同时存在时，子应用指定优先级更高；
- 当提供 `string` 类型时需要其值是 `selector`, Garfish 内部会使用 `document.querySelector(domGetter)` 去选中子应用的挂载点；
- 当提供函数时，将在子应用挂载过程中执行此函数，并期望返回一个 dom 元素；

### basename?

- Type: <span style={{color: '#ff5874', margin: '2px 6px'}}> string </span>
- 子应用的基础路径，可选，默认值为 '/'；
- 若 [子应用 AppInfo](./run.md#apps) 单独指定则子应用中优先级更高；

### props?

- Type: <span style={{color: '#ff5874', margin: '2px 6px'}}> Object </span>
- 初始化时主应用传递给子应用的数据，可选。子应用 [`provider` 导出函数](../guide/quickStart/quickStart.md#2导出-provider-函数) 生命周期方法中将接收到此数据；

### disablePreloadApp?

- Type: <span style={{color: '#ff5874', margin: '2px 6px'}}> boolean </span>
- 是否禁用子应用的资源预加载，可选，默认值为 `false`。默认情况下 Garfish 会开启子应用的资源预加载能力；
- Garfish 会在用户端计算子应用打开的次数 应用的打开次数越多，预加载权重越大；
- 预加载能力在弱网情况和手机端将不会开启；

### sandbox?

- Type: <span style={{color: '#ff5874', display: 'inline-block', margin: '4px 6px'}}> SandboxConfig | false </span>可选，默认值为 SandboxConfig。当设置为 false 时关闭沙箱；

```ts
interface SandboxConfig {
  // 是否开启快照沙箱，默认值为 false：关闭快照沙箱，开启 vm 沙箱
  snapshot?: boolean;
  // 是否修复子应用请求的 baseUrl（请求为相对路径时才生效）,默认值为 false
  fixBaseUrl?: boolean;
  // TODO: 是否要暴露？
  disableWith?: boolean;
  // 是否开启开启严格隔离，默认值为 false。开启严格隔离后，子应用的渲染节点将会开启 Shadow DOM close 模式，并且子应用的查询和添加行为仅会在 DOM 作用域内进行
  strictIsolation?: boolean;
  // modules 仅在 vm 沙箱时有效，用于覆盖子应用执行上下文的环境变量，使用自定义的执行上下文，默认值为[]
  modules?: Array<Module> | Record<string, Module>;
}

type Module = (sandbox: Sandbox) => OverridesData | void;

export interface OverridesData {
  recover?: (context: Sandbox['global']) => void;
  prepare?: () => void;
  created?: (context: Sandbox['global']) => void;
  override?: Record<PropertyKey, any>;
}
```

- 示例

```ts
Garfish.run({
  sandbox: {
    snapshot: false,
    strictIsolation: false,
    // 覆盖子应用 localStorage，使用当前主应用 localStorage
    modules: [
      () => ({
        override: {
          localStorage: window.localStorage,
        },
      }),
    ],
  },
});
```

- `sandbox.modules` 为 Garfish 开放的自定义沙箱环境范式，属于进阶功能，可前往 [如何定制沙箱环境](../guide/concept/sandbox.md) 查看详细内容；

:::caution
请注意：
如果你在沙箱内自定义的行为将会产生副作用，请确保在 recover 函数中清除你的副作用，garfish 将在应用卸载过程中执行 recover 函数销毁沙箱副作用，否则可能会造成内存泄漏。
:::

### autoRefreshApp?

- Type: <span style={{color: '#ff5874', margin: '2px 6px'}}> boolean </span>
- 主应用在已经打开子应用页面的前提下，跳转子应用的子路由触发子应用的视图更新，默认值为 `true`；
- 若关闭 `autoRefreshApp`, 则跳转 <span style={{color: '#ff5874'}}> 子应用子路由 </span> 将只能通过 [Garfish.router](./#router.md) 进行跳转，使用框架自身路由 API（如 react-router）跳转将失效；
- 在某些场景下，通过主应用触发子应用视图更新可能会导致触发子应用的视图刷新而触发子应用的 hook，所以提供关闭触发子应用视图刷新的能力；

### protectVariable?

- Type: <span style={{color: '#ff5874', margin: '2px 6px'}}> string[] </span>
- 在开启沙箱的情况下，提供使得 window 上的某些变量处于受保护状态的能力：这些值的读写不会受到沙箱隔离机制的影响，所有应用均可读取到，可选；
- 若希望在应用间共享 window 上的某些值，可将该值放置在数组中；
- 该属性与 [setGlobalValue](../api/setGlobal.md) 功能相同，推荐使用 protectVariable 属性；

### apps?

- Type: <span style={{color: '#ff5874', margin: '2px 6px'}}> AppInfo[] </span>
- 子应用列表信息，此字段参数信息与 [registerApp](../api/registerApp.md) 一致，可跳转查看详细介绍；

```ts
export interface AppInfo extends AppConfig, AppLifecycle {}

export interface AppGlobalConfig {
  // 子应用的基础路径，同上，此处会覆盖默认的 basename
  basename?: string;
  // 子应用挂载点，同上，此处会覆盖全局默认的 domGetter
  domGetter?: DomGetter;
  // 传递给子应用的数据, 同上，此处会覆盖全局默认的 props
  props?: Record<string, any>;
  // 子应用的沙箱配置，同上，此处会覆盖全局默认的 sandbox
  sandbox?: false | SandboxConfig;
}

export type AppConfig = Partial<AppGlobalConfig> & {
  // 子应用的名称，需要唯一
  name: string;
  // 子应用的入口资源地址，支持 HTML 和 JS
  entry?: string;
  // 是否缓存子应用，默认值为 true；
  cache?: boolean;
  // 是否检查 provider, 默认为true；
  // TODO：什么情况下需要设置为 false ?
  noCheckProvider?: boolean;
};
```

- 示例

```ts
Garfish.run({
  ...,
  apps: [
    {
      name: 'vue-app',
      basename: '/demo',
      activeWhen: '/vue-app',
      entry: 'http://localhost:3000',
      props: {
        msg: 'vue-app msg',
      }
    }
  }
]
```

### beforeLoad?

- Type: <span style={{color: '#ff5874', margin: '2px 6px'}}> async (appInfo: AppInfo, appInstance: interfaces.App) => false | undefined </span>
  - 该 `hook` 的参数分别为：应用信息、应用实例；
  - 当返回 `false` 时将中断子应用的加载及后续流程；
- Kind: `async`, `sequential`
- Trigger:

  - 在调用 `Garfish.load` 时触发该 `hook`
  - 子应用加载前触发，此时还未开始加载子应用资源；

- 示例

```ts
Garfish.run({
  ...,
  beforeLoad(appInfo) {
    console.log('子应用开始加载', appInfo.name);
  }
```

### afterLoad?

- Type: <span style={{color: '#ff5874', margin: '2px 6px'}}> async (appInfo: AppInfo, appInstance: interfaces.App) => void </span>
- 该 `hook` 的参数分别为：应用信息、应用实例；
- Kind: `async`, `sequential`
- Trigger:

  - 在调用 `Garfish.load` 后并且子应用加载完成时触发该 `hook`；

- 示例

```ts
Garfish.run({
  ...,
  afterLoad(appInfo) {
    console.log('子应用加载完成', appInfo.name);
  }
```

### errorLoadApp?

- Type: <span style={{color: '#ff5874', margin: '2px 6px'}}> (error: Error, appInfo: AppInfo, appInstance: interfaces.App) => void </span>
  - 该 `hook` 的参数分别为：`error` 实例、 `appInfo` 信息、`appInstance` 应用实例
  - 一旦设置该 hook，子应用加载错误不会 throw 到文档流中，全局错误监听将无法捕获到；
- Kind: `sync`, `sequential`
- Trigger:

  - 在调用 `Garfish.load` 过程中，并且加载失败时触发该 `hook`

- 示例

```ts
Garfish.run({
  ...,
  errorLoadApp(error, appInfo) {
    console.log('子应用加载异常', appInfo.name);
    console.error(error);
  },
```

### beforeMount?

- Type: <span style={{color: '#ff5874', margin: '2px 6px'}}> (appInfo: AppInfo, appInstance: interfaces.App, cacheMode: boolean) => void </span>
  - 该 `hook` 的参数分别为：`appInfo` 信息、`appInstance` 应用实例、是否为 `缓存模式` 渲染和销毁
- Kind: `sync`, `sequential`
- Previous Hook: `beforeLoad`、`afterLoad`
- Trigger:

  - 此时子应用资源准备完成，运行时环境初始化完成，准备开始渲染子应用 DOM 树；
  - 在调用 `app.mount` 或 `app.show` 触发该 `hook`，用户除了手动调用这两个方法外，`Garfish Router` 托管模式还会自动触发
    - 在使用 `app.mount` 渲染应用是 `cacheMode` 为 `false`；
    - 在使用 `app.show` 渲染应用是 `cacheMode` 为 `true`；

- 示例

```ts
Garfish.run({
  ...,
  beforeMount(appInfo) {
    console.log('子应用开始渲染', appInfo.name);
  },
```

### afterMount?

- Type: <span style={{color: '#ff5874', margin: '2px 6px'}}> (appInfo: AppInfo, appInstance: interfaces.App, cacheMode: boolean) => void </span>
  - 该 `hook` 的参数分别为：`appInfo` 信息、`appInstance` 应用实例、是否为 `缓存模式` 渲染和销毁
- Kind: `sync`, `sequential`
- Previous Hook: `beforeLoad`、`afterLoad`、`beforeMount`
- Trigger:

  - 此时子应用 DOM 树已渲染完成，garfish 实例 `activeApps` 中已添加当前子应用 app 实例；
  - 在挂载过程中，会调用应用生命周期中的 [`render` 函数](../guide/quickStart#2导出-provider-函数)，用户可在挂载前定义相关操作；
  - 若挂载过程中出现异常，会触发 [errorMountApp](./run.md#errorMountApp)，同时会清除已创建的 app 渲染容器 appContainer

- 示例

```ts
Garfish.run({
  ...,
  afterMount(appInfo) {
    console.log('子应用渲染结束', appInfo.name);
  }
```

### errorMountApp?

- Type: <span style={{color: '#ff5874', margin: '2px 6px'}}> (error: Error, appInfo: AppInfo, appInstance: interfaces.App) => void </span>
  - 一旦设置该 hook，子应用加载错误不会 throw 到文档流中，全局错误监听将无法捕获到；
- Kind: `sync`, `sequential`
- Previous Hook: `beforeLoad`、`afterLoad`、`beforeMount`、`afterMount`
- Trigger:

  - 在渲染过程中出现异常会触发该 `hook`，子应用同步执行的代码出现异常会触发该 `hook`，异步代码无法触发

- 示例

```ts
Garfish.run({
  ...,
  errorMountApp(error, appInfo) {
    console.log('子应用渲染异常', appInfo.name);
    console.error(error);
  },
```

### beforeUnmount?

- Type: <span style={{color: '#ff5874', margin: '2px 6px'}}> ( appInfo: AppInfo, appInstance: interfaces.App) => void </span>
- Kind: `sync`, `sequential`
- Previous Hook: `beforeLoad`、`afterLoad`、`beforeMount`、`afterMount`
- Trigger:
  - 在调用 `app.unmount` 或 `app.hide` 触发该 `hook`，用户除了手动调用这两个方法外，`Garfish Router` 托管模式还会自动触发
    - 在使用 `app.unmount` 渲染应用是 `cacheMode` 为 `false`；
    - 在使用 `app.hide` 渲染应用是 `cacheMode` 为 `true`；
  - 此时子应用 DOM 元素还未卸载，副作用尚未清除；
  - 此时子应用 DOM 树已渲染完成，garfish 实例 `activeApps` 中已添加当前子应用 app 实例；

### afterUnmount?

- Type: <span style={{color: '#ff5874', margin: '2px 6px'}}> ( appInfo: AppInfo, appInstance: interfaces.App) => void </span>
- Kind: `sync`, `sequential`
- Trigger:
  - 此时，应用在渲和运行过程中产生的副作用已清除，DOM 已卸载，沙箱副作用已清除，garfish 实例 `activeApps` 当前 app 已移除；
  - 在应用销毁过程中会调用应用生命周期中的 [`destory` 函数](../guide/quickStart#2导出-provider-函数)，用户可在销毁前定义相关操作；
  - 若应用卸载过程中出现异常，会触发 [errorUnmountApp](./run.md#errorUnmountApp)

### errorUnmountApp?

- Type: <span style={{color: '#ff5874', margin: '2px 6px'}}> (error: Error, appInfo: AppInfo, appInstance: interfaces.App)=> void </span>
  - 一旦设置该 hook，子应用销毁错误不会向上 throw 到文档流中，全局错误监听将无法捕获到；
- Kind: `sync`, `sequential`
- Trigger:

  - 在 `app.unmount` 或 `app.hide` 销毁过程中出现异常则会触发该 `hook`，用户除了手动调用这两个方法外，`Garfish Router` 托管模式还会自动触发

- 示例

```ts
Garfish.run({
  ...,
  errorUnmountApp(error, appInfo) {
    console.log('子应用销毁异常', appInfo.name);
    console.error(error);
  },
```

### onNotMatchRouter?

- Type: <span style={{color: '#ff5874', margin: '2px 6px'}}> (path: string)=> void </span>
  - 该 `hook` 的参数分别为：应用信息、应用实例；
- Kind: `sync`, `sequential`
- Trigger:

  - 路由发生变化当前未激活子应用且未匹配到任何子应用时触发

- 示例

```ts
Garfish.run({
  ...,
  onNotMatchRouter(path) {
    console.log('未匹配到子应用', path);
  },
```
