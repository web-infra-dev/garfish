---
title: Garfish.registerApp
slug: /api/registerApp
order: 3
---

用于注册子应用信息，为 Garfish 实例方法。

:::info
1. `Garfish.run()` 中 apps 应用信息注册底层就是依赖 `registerApp` 的注册能力；
2. `registerApp` 为Garfish 实例方法，用户可调用该 API 动态注册子应用信息，若出现 `Garfish.run()` 中的同名 app 应用信息，将覆盖`Garfish.run()` 中的 app 应用信息（merge, not override）；
:::
## 类型
  ```ts
  registerApp(list: interfaces.AppInfo | Array<interfaces.AppInfo>): Garfish;
  ```
## 默认值
- 无
## 示例
  ```ts
  import Garfish from 'garfish';

  // 注册单个应用：
  Garfish.registerApp({
    name: 'vue-app',
    basename: '/demo',
    activeWhen: '/vue-app',
    entry: 'http://localhost:3000',
    props: {
      msg: 'vue-app msg'
    }
  });

  // 注册多个应用
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
## Type AppInfo
  > AppInfo 为子应用 app 配置类型，此配置与 Garfish.run() 全局配置中 app 相关参数含义相同。

```ts
export interface AppInfo extends AppConfig, AppLifecycle {}
```
:::info
  Garfish 处理 app 参数的原则是：
  1. 对于同名字段，子应用中的配置具备更高优先级；
  2. 默认情况下，Garfish 使用全局配置作为每个子应用配置；
  3. 针对单个子应用的信息配置不影响其它子应用；
:::
## 参数
### name
  - Type: <span style={{color: '#ff5874', margin: '2px 6px'}}> string </span>
  - 子应用名称，必选；
  - 请确保每个子应用名称唯一；

### basename?
  - Type: <span style={{color: '#ff5874', margin: '2px 6px'}}> string </span>
  - 子应用的基础路径，可选，默认值为全局 [basename](./run.md#basename)；
  - 设置的 basename 将通过 [provider 函数](../guide/quickStart.md#2导出-provider-函数) 的参数透传给子应用，子应用需要将 basename 设置为相应子应用的基础路由，这是必须的；
  - [为什么子应用需要设置 basename ?](/issues/#子应用拿到-basename-的作用)

### entry
  - Type: <span style={{color: '#ff5874', margin: '2px 6px'}}> string </span>
  - 子应用的入口资源地址，支持HTML 和 JS 入口，必选

### domGetter?
  - Type: <span style={{color: '#ff5874', display: 'inline-block', margin: '4px 6px'}}> interfaces.DomGetter </span>
  ```ts
  export type DomGetter = string | (() => Element | null) | (() => Promise<Element>);
  ```
  - 子应用的默认挂载点，可选，默认值为全局 [domGetter](./run.md#domGetter)；
  - 当提供 `string` 类型时需要其值是 `selector`，Garfish 内部会使用 `document.querySelector(domGetter)` 去选中子应用的挂载点；
  - 当提供函数时，将在子应用挂载过程中执行此函数，并期望返回一个 dom 元素；
  - 请确保在应用渲染时，指定的 `domGetter` 存在于当前页面上，否则会抛出 [错误](/issues/#invalid-domgetter-xxx)；
### props?
  - Type: <span style={{color: '#ff5874', margin: '2px 6px'}}> Object </span>
  - 初始化时主应用传递给子应用的数据，可选。子应用 [`provider` 导出函数](../guide/quickStart.md#2导出-provider-函数) 生命周期方法中将接收到此数据；
### sandbox?
  - Type: <span style={{color: '#ff5874', display: 'inline-block', margin: '4px 6px'}}>  SandboxConfig | false </span>可选，默认值为 [全局 sandbox 配置](./run.md#sandbox)，当设置为 false 时关闭沙箱；

  - SandboxConfig：

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
  - 在什么情况下我应该关闭 sandbox ?
  > Garfish 目前已默认支持沙箱 esModule 能力，若需要在 vm 沙箱支持 esModule 应用，请使用 `@garfish/es-module` garfish 官方插件支持此能力，但这会带来严重的性能问题，[原因](/issues/#esmodule)。如果你的项目不是很需要在 vm 沙箱下运行，此时可以关闭沙箱；

  - `sandbox.modules` 为 Garfish 开放的自定义沙箱环境范式，属于进阶功能，可前往 [如何定制沙箱环境](/guide/advance/sandbox) 查看详细内容；
  - [Garfish 沙箱机制](../blog/sandbox.md#快照沙箱和vm沙箱的区别)

:::info
  若开启快照沙箱，请注意：
  1. 快照沙箱无法隔离主、子应用
  2. 快照沙箱无法支持多实例（同时加载多个子应用）
:::
### activeWhen?
  - Type: <span style={{color: '#ff5874', margin: '2px 6px'}}> string | ((path: string) => boolean) </span>
  - 子应用的激活路径或激活条件，是子应用配置中的重要配置项，接收 string 和 函数类型，可选。
  - `activeWhen` 使用场景为基于路由模式加载子应用时，计算当前应激活的子应用的判断条件，当使用手动加载 [loadApp](/api#loadApp) 时将忽略 `activeWhen` 选项。如果你的应用是基于路由驱动式挂载子应用，你应该始终传递 `activeWhen`；
  - 在每次发生路由变化时，Garfish 都会触发 activeWhen 的校验逻辑去判断当前应该激活的子应用；

  - 当参数为 string 类型时：
    - `activeWhen` 应设置为子应用的一级路由
    - Garfish 将使用字符串最短匹配原则作为激活判断条件匹配子应用，<span style={{color: '#3cee43', margin: '2px 6px'}}>各子应用的 `activeWhen` 参数应保持唯一</span>（即：Garfish 能够精准匹配到当前应该激活的子应用，应避免子应用间出现 `activeWhen` 重合的情况；

    - 在路由驱动模式下，子应用中接收到的 `basename` 参数将是 `basename` + `activeWhen`：
      <span style={{color: '#df5bf6', display: 'block', margin: '2px 6px'}}> activeWhen: '/vue-app',（basename:'/'）</span>

      - ✅ https://demo.app/vue-app
      - ✅ https://demo.app/vue-app/about
      - ✅ https://demo.app/vue-app/detail/goods
      - 🚫 https://demo.app/vue-app2
      - 🚫 https://demo.app/react-app

      <span style={{color: '#df5bf6', display: 'block', margin: '2px 6px'}}> activeWhen: '/vue-app',（basename:'/demo'）</span>

      - ✅ https://demo.app/demo/vue-app
      - ✅ https://demo.app/demo/vue-app/about
      - ✅ https://demo.app/vue-app
      - 🚫 https://demo.app/vue-app/detail/goods
      - 🚫 https://demo.app/react-app


  - 当参数为 function 类型时：
    - function 将接受到参数 path，用户可在函数内定义判断逻辑，返回 `true` 表示激活当前应用，否则应返回 `false`；
    - 示例
    ```ts
    import Garfish from "garfish";
    Garfish.run({
      ...,
      apps: [
        {
          name: "vue",
          activeWhen: (path) => path.startsWith('/vue-app') || path.startsWith('/sub-app')
          entry: 'http://localhost:3000'
        }
      ]
    })
    ```
    - 校验过程中，当参数为 function 类型时，Garfish 会将当前的路径传入激活函数分割以得到子应用的最长激活路径，并将 `basename` + `子应用最长激活路径` 传递给子应用参数；

  - 什么时候不需要设置 activeWhen?
  > activeWhen 为基于路由模式加载子应用时的激活路径（或条件），目的是为了寻找当前应该激活的子应用。当用户使用 [loadApp](/api#loadApp) 手动挂载应用时，此时可省略 `activeWhen` 参数。

:::caution
1. 子应用如果本身具备路由，在微前端的场景下，必须把 basename 作为子应用的基础路径，没有基础路由，子应用的路由可能与主应用和其他应用发生冲突；
2. 我们强留建议不要使用根路径作为子应用的激活条件，[为什么？](/issues/#根路由作为子应用的激活条件)
:::

### cache?
  - Type: <span style={{color: '#ff5874', margin: '2px 6px'}}> boolean </span>
  - 是否缓存子应用。若已加载过应用，在缓存模式下将返回相同的应用实例，可选，默认值为 `true`；
  - Garfish 默认会对加载过的 app 进行缓存策略，目的是为了节省二次渲染开销，避免重复的编译代码造成的性能浪费，以及避免逃逸代码可能造成的内存泄漏。若关闭此选项，将会严重影响子应用的加载速度，需要仔细权衡；
  - 在缓存模式下，Garfish 将不会执行子应用所有代码，仅执行 render ，可以避免逃逸代码造成的内存问题；
  - 缓存模式也存在一定的弊端，关于 Garfish 的缓存机制，请移步 [Garfish 缓存机制](/runtime/cache)；

### noCheckProvider
  - Type: <span style={{color: '#ff5874', margin: '2px 6px'}}> boolean </span>
  - 是够检测 `provider` 函数，可选，默认为 true；
  - TODO: 这个参数的使用场景是什么，是否需要暴露？
