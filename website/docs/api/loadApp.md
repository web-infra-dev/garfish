---
title: Garfish.loadApp
slug: /api/loadApp
order: 4
---

用于手动挂载子应用，可动态控制子应用的渲染和销毁。
> 通过 `Garfish.run()` API 注册的子应用会自动根据路由进行应激活子应用的匹配逻辑，属于路由驱动式的应用挂载和销毁模式。如果你的场景下希望手动控制应用的加载和销毁，你可以使用 `Garfish.loadApp()` 的方式加载应用，它是一种更加灵活的微前端应用加载模式。

:::info
1. 基于路由匹配的应用加载模式会通过子应用的 `activeWhen` 参数在在路由变化后自动判断当前应加载的子应用；
2. 在手动加载模式下（Garfish.loadApp），Garfish 不会根据路径匹配而是完全由开发者控制应用加载和销毁，此时应用加载不会受到 `activeWhen` 参数的影响；
:::

## 类型
```ts
loadApp(appName: string, options?: Omit<interfaces.AppInfo, 'name'>): Promise<interfaces.App | null>;
```

## 默认值
- 无

## 示例
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="framework">
  <TabItem value="React" label="React" default>

```jsx
import React, { useState } from 'react';
import Garfish from "garfish";
import type { interfaces } from "garfish";

// 提供 VueApp 的 React 组件
export default App = () => {
  const [app, setApp] = useState<any>(null);
  const loadApplication = async () => {
    if (!app) {
      setLoadAsync(true);
      const app = await Garfish.loadApp('vue-app', {
        cache: true,
        basename,
        domGetter: '#container',
        entry: 'http://localhost:8092',
      });
      setApp(app);
      setLoadAsync(false);
    } else {
      app.display ? app.hide() : app.show();
    }
  }

  return (
    <>
      <Button onClick={ loadApplication } >
        toggle
      </Button>
      <div id="container" >
        {loadAsync && <Spin />}
      </div>
    </>
  )
}
```
  </TabItem>
  <TabItem value="Vue" label="Vue">

```html
<!-- 提供 ReactApp 的 Vue 组件 -->
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
    async mounted() {
      appInstance = await Garfish.loadApp('react-app', {
        cache: true,
        basename: '/react-app',
        domGetter: '#container',
        entry: 'http://localhost:8093',
      });
      // 若已经渲染触发 show，只有首次渲染触发 mount，后面渲染都可以触发 show 提供性能
      appInstance.mounted
        ? appInstance.show()
        : await appInstance.mount();
    },

    destroyed() {
      appInstance.hide();
    },
  };
</script>
<style></style>
```
  </TabItem>
</Tabs>


## 参数
### name
  - Type: <span style={{color: '#ff5874', margin: '2px 6px'}}> string </span>
  - 要加载的子应用名称，必选。
  - 各子应用的名称应保持唯一，这是子应用的唯一标识；

:::tip
1. 请确保当前要加载的子应用信息已注册。Garfish 会从已注册的 app 信息中查找同名 app，若应用信息未注册将导致应用加载失败。
2. 应用信息注册可通过 `Garfish.run()`、`Garfish.registerApp()`、`Garfish.setOptions()` 三种方式注册；
:::

### options?
- Type: <span style={{color: '#ff5874', margin: '2px 6px'}}> Omit <interfaces.AppInfo, 'name'> </span>

- `options` 参数含义本质上与 [registerApp](/api/registerApp#参数) 中同名参数保持一致，可选。
- 可移步 [registerApp](/api/registerApp#参数) 查看具体参数说明；这里仅针对注意事项进行说明。

:::info
> `options` 的作用？

这里提供 `options` 是允许用户在手动加载 App 时自定义当前应用的信息参数，若之前已注册过子应用，则会将已配置信息和这里的 `options` 参数进行 deepMerge，提供用户运行时更新 App 应用信息参数的能力；

值得注意的是，若已缓存过 App 实例，则再次加载会直接返回当前缓存的实例，同时 `options` 参数仍会进行 merge。若设置 `cahce: false` 关闭缓存，则会使用当前 merge 后的配置重新生成 App 实例信息并返回；
:::

- ** 注意事项 **：
  - `options` 中不允许传递 `name` 属性，只允许更新当前 App 的应用信息参数；
  - `options` 若不传，则会默认使用已注册的应用信息参数；
  - `options` 若传递，则会覆盖已注册应用信息中的同名属性(二者进行 deepMerge)，请确保在应用信息 merge 后 `entry` 入口信息参数存在，否则将会抛出错误；
  - 子应用信息的更新不影响全局配置；

## 返回值

```ts
import Garfish from "garfish";
import type { interfaces } from "garfish";

let app: interfaces.App;
app = await Garfish.loadApp('vue-app', {
    cache: true,
    basename,
    domGetter: '#container',
    entry: 'http://localhost:8092',
});
```
> loadApp 的返回值为子应用的 App 实例对象，实例对象上存在一些方法和属性，提供给开发者用于手动进行 App 的挂载、销毁及判断 App 当前应用状态等信息；

### 实例属性
  - <span style={{color: '#ff5874', display: 'block', margin: '2px 6px'}}> name: string </span>

  应用名称，string。

  - <span style={{color: '#ff5874', display: 'block', margin: '2px 6px'}}> mounted: boolean </span>

  应用是否已挂载，boolean。 `true` 表示已挂载，`false` 表示未挂载。

  - <span style={{color: '#ff5874', display: 'block', margin: '2px 6px'}}> display: boolean </span>

  应用是否被隐藏，boolean。 `true` 表示显示状态，未隐藏，`false` 表示隐藏态。

  - <span style={{color: '#ff5874', display: 'block',  margin: '2px 6px'}}> strictIsolation: boolean </span>

  是否开启严格隔离。`true` 表示已开启，`false` 表示未开启。

  - <span style={{color: '#ff5874', display: 'block',  margin: '2px 6px'}}> isHtmlMode: boolean </span>

  是否是 `html` 入口模式。

  - <span style={{color: '#ff5874', display: 'block',  margin: '2px 6px'}}> appContainer: HTMLElement </span>

  应用容器

  - <span style={{color: '#ff5874', display: 'block',  margin: '2px 6px'}}> appInfo: AppInfo </span>

  应用配置信息

  - <span style={{color: '#ff5874', display: 'block',  margin: '2px 6px'}}> hooks: interfaces.AppHooks </span>
  应用生命周期钩子函数

### 实例方法

- app.mount()
  - Type
  ```ts
  mount(): Promise<boolean>
  ```
  - 示例
  ```ts
  import Garfish from "garfish";
  import type { interfaces } from "garfish";

  const app = await Garfish.loadApp('vue-app', {
    cache: true,
    basename,
    domGetter: '#container',
    entry: 'http://localhost:3000',
  });
  await app.mount();
  ```
  - 触发子应用的 <span style={{color: '#ff5874'}}>渲染</span> 流程。若应用<span style={{color: '#9b67f6'}}> 已挂载 </span>、或<span style={{color: '#9b67f6'}}> 正在挂载中 </span>、或<span style={{color: '#9b67f6'}}> 正在卸载中 </span>将不会触发渲染流程；
  - 在子应用渲染前将会触发 `beforeMount` 钩子函数，渲染完成将触发 `afterMount` 钩子函数并将当前挂载的应用 push 进 `Garfish.activeApps`。若渲染过程中出现异常将触发 `errorMountApp`钩子函数；
  - 在此过程中将执行 `provider` 提供的子应用 `render` 函数，若 `provider` 函数未找到将会抛出错误。[尝试解决](/issues/#provider-is-null)
  - [mount 过程中都做了哪些事情](/runtime/lifecycle#mount)

:::info 请注意：
对于 es module 子应用(如 Vite 应用)，路由驱动模式下默认走缓存模式。子应用不可重复使用 `app.mount`，应用二次渲染只能使用 `app.show()`；
:::

- app.unmount()
  ```ts
  unmount(): boolean;
  ```
  - 触发子应用的 <span style={{color: '#ff5874'}}>销毁</span> 流程。若应用<span style={{color: '#9b67f6'}}> 正在卸载中 </span>，将不会重复卸载；
  - 在子应用渲染前将会触发 `beforeUnmount` 钩子函数，渲染完成将触发 `afterUnmount` ，若销毁过程中出现异常将触发 `errorUnmountApp` 钩子函数；
  - 应用卸载过程中会执行 `provider` 内部提供的 `destroy` 函数。卸载完成后，子应用的渲染容器将被移除、子应用的执行上下文也将被销毁，渲染过程中产生的副作用也都将会被清除，同时将子应用从
`Garfish.activeApps` 里移除，`mounted` 和 `display` 状态置为 false；
  - [unmount 过程中都做了哪些事情](/runtime/lifecycle#unmount)

- app.show()
  - Type
  ```ts
  show(): Promise<boolean>
  ```
  - 触发子应用的 <span style={{color: '#ff5874'}}>显示</span> 流程；
  - 示例
    ```ts
    import Garfish from "garfish";
    import type { interfaces } from "garfish";

    const app = await Garfish.loadApp('vue-app', {
      cache: true,
      basename,
      domGetter: '#container',
      entry: 'http://localhost:3000',
    });
    // 若已经渲染触发 show，只有首次渲染触发 mount，后面渲染都可以触发 show 提供性能
    app.mounted ? app.show() : await app.mount();
    ```
  - 触发子应用的 <span style={{color: '#ff5874'}}>显示</span> 流程。若应用<span style={{color: '#9b67f6'}}> 已显示 </span>、或<span style={{color: '#9b67f6'}}> 未挂载 </span> 将不会触发应用渲染流程；

  - 在子应用显示前将会触发 `beforeMount` 钩子函数，显示完成将触发 `afterMount` 钩子函数并将当前挂载的应用 push 进 `Garfish.activeApps`；
  - 在此过程中将执行 `provider` 提供的子应用 render 函数，若 `provider` 函数未找到将会抛出错误。[尝试解决](/issues/#provider-is-null)
  - [show 过程中都做了哪些事情](/runtime/lifecycle#show)

:::info 请注意：
1. `app.show()` 用于触发子应用的显示流程，此过程并不是 css 中样式的显示或隐藏，show() 方法会触发子应用的 `render` 函数，若 `render` 函数中存在副作用也会再次执行；
2. `app.show()` 在应用渲染的过程中将会执行 `provider` 中提供的 `render` 函数，但与 `app.mount()` 不同的是，`app.show()` 不会创建新的执行上下文；
3. 在基于路由驱动子应用加载模式下，若已启用缓存(`cache: true`)，则会默认使用 show() 触发子应用的渲染。若未开启缓存模式，则会使用 `app.mount()` 渲染子应用。非路由驱动模式下，由开发者控制子应用的渲染和销毁；
:::

- app.hide()
  - Type
  ```ts
  hide(): boolean;
  ```
  - 触发子应用的 <span style={{color: '#ff5874'}}>隐藏</span> 流程。若应用<span style={{color: '#9b67f6'}}> 未显示 </span>、或<span style={{color: '#9b67f6'}}> 未挂载 </span> 将不会触发应用隐藏流程；

  - 在子应用隐藏前将会触发 `beforeUnmount` 钩子函数，隐藏完成将触发 `afterUnmount` 钩子函数并将当前隐藏的应用从 `Garfish.activeApps` 中移除；
  - 在此过程中将执行 `provider` 提供的子应用 `destory` 函数。当移除完成，子应用的渲染容器也将被移除。
  - [hide 过程中都做了哪些事情](/runtime/lifecycle#hide)
