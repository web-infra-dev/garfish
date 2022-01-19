---
title: Garfish.router
slug: /api/router
order: 5
---

`Garfish.router` 是 Garfish 提供的路由方法，通过 router 可以提供路由能力

## router.push

`router.push({ path: string, query?: Record<string, string>, basename?: string }) : void`<br />

想要导航到不同的 URL，则使用 `router.push` 方法。这个方法会向 `history` 栈添加一个新的记录，所以，当用户点击浏览器后退按钮时，则回到之前的 `URL`。

### 注意点

- 如果有在 `Garfish.run` 时配置，`basename`。将在跳转时增加 `basename` 作为跳转前缀，可以通过 push 函数设置 basename，用于覆盖默认的 basename
- 使用 `Garfish` 提供的路由方法，在已经打开子应用的场景下跳转对应子应用的子路由会触发组件更新
  > 在非 `Garfish` 微前端环境，直接使用 `history.pushState` 跳转路由是不会触发对应路由的组件更新的，原因在于 `vue` 和 `react` 不是监听路由变化和触发组件更新
- 本 `api` 可以在 `react-router-prompt` 触发多次时，配合 `autoRefreshApp` 配置。关闭其他跳转方法触发子应用刷新组件，可限制 `prompt` 触发多次或子应用额外卸载多次的场景。
- `autoRefreshApp` 选项关闭后，可以只能通过 `Garfish.router` 跳转子应用路由
- 若不确定主应用的 `basename` 为何值时，在跳转时将 basename 设置为 '/'，即可

### 案例

```js
import Garfish from 'garfish';
Garfish.router.push({ path: '/vue-a' );
Garfish.router.replace({ path: '/react2' })
```

## router.replace

`router.replace({ path: string, query?: Record<string, string>, basename?: string }) : void`

跟 `router.push` 很像，唯一的不同就是，它不会向 `history` 添加新记录，而是跟它的方法名一样，替换掉当前的 `history` 记录，basename 的默认值为 Garfish options 的 `basename`

## router.beforeEach

`router.beforeEach(to: RouterInfo, from: RouterInfo, next: Function): void`

在路由跳转后，子应用挂载前触发。

```ts
interface RouterInfo {
  fullPath: string;
  path: string;
  query: Object;
  matched: Array<AppInfo>;
}
```

每个守卫方法接收三个参数

- `to ` 即将要进入的目标路由信息。
- `from` 即将离开的路由信息。
- `next` 阻塞执行回调。

```js
Garfish.router.beforeEach((to, from, next) => {
  // console.log(to, from);
  next();
})

Garfish.router.afterEach((to, from, next) => {
  // console.log(to, from);
  next();autoRefreshApp
})

Garfish.run(...);
```

## router.afterEach

`router.afterEach(to: RouterInfo, from: RouterInfo, next) : void`

跟 `router.afterEach` 很像，唯一的不同就是，在路由跳转后，子应用挂载后触发。

## 路由守卫

正如其名，提供的导航守卫主要用来通过跳转或取消的方式守卫导航。在微前端环境中，跳转路由时，路由守卫在未调用 `next` 函数时，将会阻塞子应用的渲染。

> 但是不能阻塞子应用内的路由跳转，因为子应用内的路由跳转不能被 `Garfish` 阻塞

:::note 注意点：

- 将路由守卫注册放在 `Garfish.run` 前执行，否则将无法接收到首次加载是的路由钩子。
- 若使用了路由守卫，请确保 `next` 函数被执行，否则将会阻塞路由内部加载逻辑。
  :::
