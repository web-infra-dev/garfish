---
title: Garfish.registerApp
slug: /api/registerApp
order: 3
---
import Highlight from '@site/src/components/Highlight';
import SandboxConfig from '@site/src/components/config/_sandbox.mdx';
import DomGetter from '@site/src/components/config/_domGetter.mdx';
import BaseNameConfig from '@site/src/components/config/_basename.mdx';

用于注册子应用信息，为 Garfish 实例方法。

:::info

1. `Garfish.run()` 中 apps 应用信息注册底层就是依赖 `registerApp` 的注册能力；
2. `registerApp` 为 Garfish 实例方法，用户可调用该 API 动态注册子应用信息，若出现 `Garfish.run()` 中的同名 app 应用信息，将覆盖`Garfish.run()` 中的 app 应用信息（merge, not override）；
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
    msg: 'vue-app msg',
  },
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

- Type: <Highlight> string </Highlight>
- 子应用名称，必选；
- 请确保每个子应用名称唯一；

### basename?

<BaseNameConfig />

### entry

- Type: <Highlight> string </Highlight>
- 子应用的入口资源地址，支持 HTML 和 JS 入口，必选

### domGetter?

<DomGetter />

### props?

- Type: <Highlight> Object </Highlight>
- 初始化时主应用传递给子应用的数据，可选。子应用 [`provider` 导出函数](/guide/quickStart/start.md#2导出-provider-函数) 生命周期方法中将接收到此数据；

### sandbox?

<SandboxConfig />

### activeWhen?

- Type: <Highlight> string | ((path: string) => boolean) </Highlight>
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

- Type: <Highlight> boolean </Highlight>
- 是否缓存子应用。若已加载过应用，在缓存模式下将返回相同的应用实例，可选，默认值为 `true`；
- Garfish 默认会对加载过的 app 进行缓存策略，目的是为了节省二次渲染开销，避免重复的编译代码造成的性能浪费，以及避免逃逸代码可能造成的内存泄漏。若关闭此选项，将会严重影响子应用的加载速度，需要仔细权衡；
- 在缓存模式下，Garfish 将不会执行子应用所有代码，仅执行 render ，可以避免逃逸代码造成的内存问题；
- 缓存模式也存在一定的弊端，关于 Garfish 的缓存机制，请移步 [Garfish 缓存机制](/guide/cache)；

### noCheckProvider

- Type: <Highlight> boolean </Highlight>
- 是否检查 `provider` 函数，可选，默认为 true；
