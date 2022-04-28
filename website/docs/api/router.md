---
title: Garfish.router
slug: /api/router
order: 5
---
import Highlight from '@site/src/components/Highlight';


用于微前端下的应用间的路由跳转，提供路守卫能力，在路由变化时触发相应hook，帮助用户更加精确的控制路由变化，灵活地支持各类业务场景。

> 路由是微前端中重要且复杂的模块。在微前端应用下，子应用既可作为独立应用运行在自己的路由系统下，又可作为子应用嵌入在主应用下加载，为了实现两种模式的无缝切换，Garfish 实现了一套路由机制保证用户在这两种模式中平滑过渡，你可以在 [Garfish 路由机制](/guide/router) 中了解详细设计。

:::info
在阅读下面 API 介绍之前，你需要了解和保证一些配置规范。
:::

1. 你需要了解的：
  - 目前 Garfish 路由系统通过命名空间（即子应用 basename）来避免应用间的路由冲突；
  - 目前 Garfish 路由系统仅支持主应用的 history 路由模式，原因是 hash 路由无法作为子应用的基础路由；
  - 不要使用根路由作为子应用的激活条件，否则该应用在任何路径下都会激活，且应用间可能会产生冲突；
  - 子应用在 `provider` 中的 `render` 函数拿到的 `basename` = `主应用的 basename` + `activeWhen`；

2. 你需要配置的：
  - 请将 `provider` 中 `render` 函数接收到的 `basename` 设置为子应用的 `basename`，[如何配置](/guide/demo/react#3-根组件设置路由的-basename)；

## `Garfish.router`
`Garfish.router` 是 Garfish 实例上的属性，由 Garfish 路由系统提供。该属性上提供应用间路由跳转的方法、路由导航守卫钩子函数以及路由相关配置信息。其类型定义如下：
### Type
```ts
interface Garfish {
    router: RouterInterface;
    apps: Record<string, interfaces.App>;
}

interface RouterInterface {
    push: ({ path, query, basename}: {
        path: string;
        basename?: string;
        query?: {
            [key: string]: string;
        };
    }) => void;
    replace: ({ path, query, basename}: {
        path: string;
        basename?: string;
        query?: {
            [key: string]: string;
        };
    }) => void;
    beforeEach: (hook: RouterHook) => void;
    afterEach: (hook: RouterHook) => void;
    registerRouter: (Apps: interfaces.AppInfo | Array<interfaces.AppInfo>) => void;
    routerChange: (hook: RouterChange) => void;
    setRouterConfig: typeof setRouterConfig;
    listenRouterAndReDirect: ({ apps, basename, autoRefreshApp, active, deactive, notMatch}: Options$1) => void;
    routerConfig: Options$1;
}
```
### 默认值
- 无
### Garfish.router.push
路由导航方法。
#### Type
```ts
push: ({ path, query, basename}: {
      path: string;
      basename?: string;
      query?: {
          [key: string]: string;
      };
  }) => void;
```
#### 参数
- <Highlight>path</Highlight>

  要跳转的路由，`string`，必选。
- <Highlight>basename</Highlight>

  设置跳转的基础路由，`string`，非必选。
- <Highlight>query</Highlight>

  路由携带的查询参数，`Record<string, string>`，非必选。

#### 示例
```ts
import Garfish from 'garfish';

// 跳转 vue-a 应用：
Garfish.router.push({
  path: '/vue-a'
});

// 跳转 react-b 应用详情页：
Garfish.router.push({
  path: "/react-b/detail",
  query: { id: "002" },
});
```
#### 说明
1. `Garfish.router.push()` 方法默认会携带上全局 basename 作为跳转前缀，若使用框架自身路由进行跳转，请记得主动添加`basename` 跳转前缀。下面两种跳转方式等价：
  ```ts
  Garfish.router.push({ path: '/react-b' });
  navigate('/examples/react-b'); // navigate 为 react-router-dom v6 跳转方法
  ```
2. 此方法会向 history 栈添加新的记录，点击浏览器后退按钮后能正常返回上一个页面；
3. 若跳转子应用的子路由，使用 `Garfish.router.push()` 方法跳转将触发子应用子路由视图更新。另外若关闭 [autoRefreshApp](/api/run#autorefreshapp) 选项，则将**只能**使用 `Garfish.router` 进行跳转子应用子路由，但子应用一级路由仍将可使用框架路由跳转。
4.  本 api 可以在 react-router-prompt 触发多次时，配合 autoRefreshApp 配置。关闭其他跳转方法触发子应用刷新组件，可限制 prompt 触发多次或子应用额外卸载多次的场景。

:::info
由于目前主流框架并不是通过监听路由变化来触发组件的更新的。在跳转子应用子路由时，若直接使用 `history.pushState` 将不会触发对应路由的组件更新，请使用 `Garfish.router` 提供的方法进行跳转。
:::

### Garfish.router.replace
路由导航方法。
#### Type
```ts
replace: ({ path, query, basename}: {
      path: string;
      basename?: string;
      query?: {
          [key: string]: string;
      };
  }) => void;
```

#### 参数
- <Highlight>path</Highlight>

  要跳转的路由，`string`，必选。
- <Highlight>basename</Highlight>

  设置跳转的基础路由，`string`，非必选。
- <Highlight>query</Highlight>

  路由携带的查询参数，`Record<string, string>`，非必选。

#### 示例
```ts
import Garfish from 'garfish';
// 跳转 react-a 应用：
Garfish.router.replace({
  path: '/react-a'
});
```
#### 说明
1. `Garfish.router.replace()` 方法与 [Garfish.router.push()](/api/router#garfishrouterpush) 方法类似，唯一的区别是：它不会向 history 添加新记录，而是跟替换掉当前的 history 记录；
2. 其它参数请参考 [Garfish.router.push()](/api/router#garfishrouterpush)

### Garfish.router.beforeEach
#### 触发时机
- 全局路由守卫，在**路由跳转后**，**子应用挂载前**触发。
#### Type
```ts
beforeEach: (hook: RouterHook) => void;

type RouterHook = (
  to: CurrentRouterInfo,
  from: CurrentRouterInfo,
  next,
) => void;

export interface CurrentRouterInfo {
  fullPath: string;
  path: string;
  query: Object;
  state: Object;
  matched: Array<interfaces.AppInfo>;
}
```
#### 参数
- <Highlight>to</Highlight>
  ：即将要进入的目标路由信息。

- <Highlight>from</Highlight>
  ：即将离开的路由信息。

- <Highlight>next</Highlight>
  ：阻塞执行回调。

#### 示例
```ts
import Garfish from 'garfish';
Garfish.router.beforeEach((to, from, next) => {
  next();
});

Garfish.run({...})
```

### Garfish.router.afterEach
#### 触发时机
- 全局路由守卫，在**路由跳转后**，**子应用挂载后**触发。
#### Type
```ts
afterEach: (hook: RouterHook) => void;

type RouterHook = (
  to: CurrentRouterInfo,
  from: CurrentRouterInfo,
  next,
) => void;

export interface CurrentRouterInfo {
  fullPath: string;
  path: string;
  query: Object;
  state: Object;
  matched: Array<interfaces.AppInfo>;
}
```
#### 参数
- <Highlight>to</Highlight>
  ：即将要进入的目标路由信息。

- <Highlight>from</Highlight>
  ：即将离开的路由信息。

- <Highlight>next</Highlight>
  ：阻塞执行回调。

#### 示例
```ts
import Garfish from 'garfish';
Garfish.router.afterEach((to, from, next) => {
  next();
});

Garfish.run({...})
```

:::tip
请注意：
1. `Garfish.router.beforeEach` 和 `Garfish.router.afterEach` 均属于 Garfish 提供的路由守卫钩子，将在每次在路由变化后触发。
2. 请将路由守卫注册放在 `Garfish.run` 前执行，否则将无法接收到首次加载时的路由钩子；
3. 若跳转新的子应用，则 `Garfish.router.beforeEach` 将在子应用加载前触发，`Garfish.router.afterEach` 将在子应用加载后触发。此时路由均已发生变化；
4. `next` 函数可为异步函数，微前端渲染流程将被阻塞直至 `next` 函数被 resolve。
5. 在子应用间跳转时，若使用了路由守卫钩子，请确保 `next` 函数被执行，否则将导致 Garfish 内部子应用渲染逻辑被阻塞；
6. 子应用内路由跳转不受 `next` 函数调用的影响；
