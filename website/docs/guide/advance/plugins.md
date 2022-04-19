---
title: 插件指南
slug: /guide/advance/plugins
order: 6
---

Garfish 框架引入了插件化机制，目的是为了让开发者能够通过编写插件的方式扩展更多功能，或为自身业务定制个性化功能；同时框架的基础能力也都是通过插件机制来实现，确保框架核心足够精简和稳定。

## 插件能做什么

插件的功能范围没有严格的限制——一般有下面两种：

1. 添加全局方法或增加默认参数
2. 在应用的生命周期中自定义功能（例如：`Garfish router`、`Garfish sandbox`）

## 编写插件

`Garfish Router` 增加了全局方法和应用的自动渲染和销毁能力，下面让我们来以 `Garfish router` 为例，如何编写一个插件，来实现路由的能力。

当插件被注册到 `Garfish` 框架时，将会调用插件函数并将 `GarfishInstance` 作为参数传递，函数的返回值中包括插件的基本信息：`name`、`version`，除了基本信息外最重要的则是包括 `hook`，`Garfish` 框架将在应用的整个生命周期中触发 `hook` 的调用，可以在 `hook` 中对信息进行二次处理或执行特定的功能。

让我们从编写插件函数开始，建议在单独的文件中创建它并将其导出，如下所示，以保持插件逻辑的整洁和分离，在实际开发过程中我们建议将实际插件的内容放置一个函数中返回，以便插件在实际调用时可接收参数

```ts
// plugins/router.ts
import type { interfaces } from 'garfish';
// function return plugin
export function GarfishRouter(_args?: any) {
  // Plugin code goes here
  return function (GarfishInstance: interfaces.Garfish): interfaces.Plugin {
    return {
      name: 'garfish-router',
      version: '1.2.1',
      // ...
    };
  };
}
```

`Garfish Router` 的这个 `plugin` 期望达到的目标是通过提供的 `Router Map` 后 `Garfish` 框架能够自动的完成微前端应用的渲染和销毁调度，从而降低典型中台中管理应用销毁和渲染的工作，提升开发效率。那么要实现这个需求我们需要依次实现以下功能：

- 扩展类型
  - `appInfo` 的类型，让 `appInfo` 类型提示支持 `activeWhen`、`basename` 等配置
  - `Garfish` 增加 `router` 类型
- 为 `Garfish` 实例扩展 `router` 方法，用于实现路由跳转和路由监听等能力
- 监听 `bootstrap hook`（该 hook 会在主应用触发 `Garfish.run` 后调用），触发 `bootstrap` 后
  - 劫持路由变化：改写 `history.push`、`history.replace`，监听 `popstate` 浏览器后退事件
  - 当路由发生变化时通过 `appInfo` 的 `activeWhen` 进行规则判断，对应用进行渲染和销毁
- 监听 `registerApp hook`（该 hook 会在注册子应用时触发）
  - 当有新注册应用时对新应用进行检验是否如何渲染条件，进行销毁

:::tip
Garfish Router 就是通过 Garfish 的 Plugin 机制实现，以下案例精简了大部分逻辑，主要介绍如何编写插件来扩展 Garfish 的整体功能，若想了解实现，请参考 [`Garfish Router plugin`](https://github.com/modern-js-dev/garfish/blob/260143bb70ca81c64069650ae278088a2ca8a62f/packages/router/src/index.ts)
:::

```ts
import type { interfaces } from 'garfish';
declare module 'garfish' {
  // 为 GarfishInstance 添加 router 方法
  export default interface Garfish {
    router: {
      push: (info: {
        path: string;
        query?: { [key: string]: string };
        basename?: string;
      }) => void;
      replace: (info: {
        path: string;
        query?: { [key: string]: string };
        basename?: string;
      }) => void;
    };
  }

  export namespace interfaces {
    // 为全局配置增加 autoRefreshApp、onNotMatchRouter 参数类型
    export interface Config {
      onNotMatchRouter?: (path: string) => Promise<void> | void;
    }

    export interface AppInfo {
      // 手动加载，可不填写路由
      activeWhen?: string | ((path: string) => boolean);
      basename?: string;
    }
  }
}

// 这里仅做伪代码的演示，功能无法正常运行
export function GarfishRouter(_args?: { autoRefreshApp?: boolean }) {
  return function (Garfish: interfaces.Garfish): interfaces.Plugin {
    // 为 Garfish 实例添加 router 方法
    Garfish.router = {
      push: ({ path }) => history.push(null, '', path),
      replace: ({ path }) => history.replace(null, '', path),
    };

    return {
      name: 'router',
      version: '1.0.0',
      // 在触发 Garfish.run 后启动路由监听，自动渲染和销毁应用
      bootstrap(options: interfaces.Options) {
        let activeApp = null;
        const unmounts: Record<string, Function> = {};
        const { basename } = options;

        const apps = Object.values(Garfish.appInfos);

        // 该函数会劫持 history 变化，当某个 appInfo 的 activeWhen 符合触发条件后会触发 active 回调
        // 提供 appInfo 信息，这个时候通过 Garfish.loadApp 加载该应用并进行销毁
        // 当某个 appInfo 处于已经渲染状态，并且在路由发生变化后处于销毁状态将会触发 deactive 回调
        // 通过 appInfo，触发缓存的 app 实例的销毁函数
        listenRouterAndReDirect({
          basename,
          active: async (appInfo: interfaces.AppInfo, rootPath: string) => {
            const { name, cache = true, active } = appInfo;

            // 当前应用处于激活状态后触发
            const app = await Garfish.loadApp(appInfo.name, {
              basename: rootPath,
              entry: appInfo.entry,
              cache: true,
              domGetter: appInfo.domGetter,
            });

            if (app) {
              const isDes = cache && app.mounted;
              isDes ? await app.show() : await app.mount();

              unmounts[name] = () => {
                const isDes = cache && app.mounted;
                isDes ? await app.show() : await app.mount();
              };
            }
          },
          deactive: async (appInfo: interfaces.AppInfo, rootPath: string) => {
            const { name, deactive } = appInfo;
            const unmount = unmounts[name];
            unmount && unmount();
          },
          autoRefreshApp,
          notMatch: onNotMatchRouter,
          apps,
          listening: true,
        });
      },

      registerApp(appInfos) {
        // 将新注册的应用信息注入到路由中
        const appList = Object.values(appInfos);
        router.registerRouter(appList.filter((app) => !!app.activeWhen));
        // 触发路由的重定向，检测当前应用是否需要触发渲染
        initRedirect();
      },
    };
  };
}
```

> 插件编写总结

- 若要为 `Garfish` 实例扩展方法，通过 `declare module` 直接扩展 `Garfish` 的 `interfaces`，然后通过插件函数获取 `Garfish` 的实例直接添加方法，用于扩展 `Garfish` 的能力
- 可通过 `namespace interfaces` 直接扩展 `Garfish config` 和 `AppInfo` 配置
- 在对应用用的生命周期中进行能力的扩展

## 插件公约

- 插件应该包括清晰的名称并携带 `garfish-plugin-` 前缀
- 如果插件单独封装至 `npm` 包，在 `package.json` 中添加 `garfish-plugin` 关键词
- 插件应该包括完备的测试
- 插件应该具备完整的使用文档
- 如果你觉得你的插件足够通用，请联系：zhouxiao.shaw@bytedance.com，评估后是否是和加入推荐列表

## 使用插件

通过调用 `Garfish.usePlugin` 方法将插件添加到你的应用程序中。

我们将使用在 [`如何编写插件`](#如何编写插件) 部分中创建的 `routerPlugin` 插件进行演示。

`usePlugin()` 方法第一个参数接收要安装的插件，在这种情况下为 `routerPlugin` 的返回值。

它还会自动阻止你多次使用同一插件，因此在同一插件上多次调用只会安装一次该插件，`Garfish` 内部通过插件执行后返回的 `name` 作为唯一标识来进行区分，在进行插件命名时，请确保不会和其他插件之间发生冲突。

```ts
import Garfish from 'garfish';
import routerPlugin from './plugins/router';

Garfish.usePlugin(routerPlugin());
```

## `usePlugin`

通过 `Garfish.usePlugin` 可以注册插件

```ts
Garfish.usePlugin(plugin: (GarfishInstance: interfaces.Garfish)=> interfaces.Plugin)
```

## `plugin`

### `name`

- Type: `string`
- 插件的名称，作为插件的唯一标识和便于调试

### `version?`

- Type: `string`
- 插件的版本号，用于观测线上环境使用使用的插件版本

### `beforeBootstrap?`

- Type: `(options: interfaces.Options) => void`
  - 该 `hook` 的第一个参数为 `Garfish.run` 提供的配置信息
- Kind: `sync`, `sequential`
- Trigger:
  - 在 [`Garfish.run`](/api/run) 调用后触发
  - 触发该 `hook` 时配置未注册到全局

### `bootstrap?`

- Type: `(options: interfaces.Options) => void`
  - 该 `hook` 的第一个参数为 `Garfish.run` 提供的配置信息
- Kind: `sync`, `sequential`
- Trigger:
  - 在 [`Garfish.run`](/api/run) 调用后触发
  - 触发该 `hook` 时配置已经注册到全局
- Previous Hook: `beforeBootstrap`

### `beforeRegisterApp?`

- Type: `(appInfo: interfaces.AppInfo | Array<interfaces.AppInfo>) => void`
  - 该 `hook` 的第一个参数为需要注册的应用信息
- Kind: `sync`, `sequential`
- Trigger:
  - 调用 [`Garfish.run`](/api/run) 且，提供了 `apps` 参数时触发
  - 直接通过 [`Garfish.registerApp`](/api/registerApp) 调用时
  - 触发该 `hook` 是子应用信息尚未注册成功

### `registerApp?`

- Type: `(appInfo: interfaces.AppInfo | Array<interfaces.AppInfo>) => void`
  - 该 `hook` 的第一个参数为需要注册的应用信息
- Kind: `sync`, `sequential`
- Trigger:
  - 调用 [`Garfish.run`](/api/run) 且，提供了 `apps` 参数时触发
  - 直接通过 [`Garfish.registerApp`](/api/registerApp) 调用时
  - 触发该 `hook` 是子应用信息注册成功

### [`beforeLoad?`](/api/run#beforeload)

### [`afterLoad?`](/api/run#afterLoad)

### [`errorLoadApp?`](/api/run#errorLoadApp)

### [`beforeMount?`](/api/run#beforeMount)

### [`afterMount?`](/api/run#afterMount)

### [`errorMountApp?`](/api/run#afterMount)

### [`beforeUnmount?`](/api/run#afterMount)

### [`errorUnmountApp?`](/api/run#afterMount)

### `beforeEval?`

- Type: `(appInfo: interfaces.AppInfo, code: string, env: Record<string, any>, url: string) => void`
  - 该 `hook` 的的参数分别为：应用信息、当前执行的代码、执行子应用代码时的环境变量、代码的资源地址
- Kind: `sync`, `sequential`
- Trigger:
  - 子应用 `html` 内的 `script` 和动态创建的脚本执行时都会触发该 `hook`
  - 实际执行代码前触发该 `hook`

### `afterEval?`

- Type: `(appInfo: interfaces.AppInfo, code: string, env: Record<string, any>, url: string) => void`
  - 该 `hook` 的的参数分别为：应用信息、当前执行的代码、执行子应用代码时的环境变量、代码的资源地址
- Kind: `sync`, `sequential`
- Trigger:
  - 子应用 `html` 内的 `script` 和动态创建的脚本执行时都会触发该 `hook`
  - 实际执行代码后触发该 `hook`
