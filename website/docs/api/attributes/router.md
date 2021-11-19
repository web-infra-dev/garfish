---
title: router
slug: /api/attributes/router
order: 3
---

提供在微前端场景下，路由相关的能力。

> 推荐使用 `Garfish.router` 作为切换子应用的 `api`，通过 `vue-router` 或 `react-router` 也可以实现应用间切换，但是在一些特殊场景将会造成异常：[react-router-prompt 触发多次](https://code.byted.org/pgcfe/gar/issues/5)

:::note 注意点：

1. 目前主应用仅支持 `history` 模式自动挂载子应用，可将 `activeWhen` 配置为函数激活条件来激活主应用为 `hash` 模式下应用

2. 当主应用和子应用都具备路由时，请将主应用改造成 `history` 模式（由于目前 Garfish 并未将子应用路由和主应用路由进行环境隔离）

   - 由于主应用路由和子应用处于同一路由执行环境，如果主应用为 `hash` 路由，子应用是 `history` 路由将会导致路由不符合规范
   - 主应用进入详情页后地址为 `http://gar.byted.com#/gar-example/detail`，加载为 history 的子应用后，路由变为`http://gar.byted.com/app1#/gar-example/detail`

3. 目前 Garfish 通过 `basePath` 隔离应用间的路由，避免发生像上面主应用和子应用路由冲突。Garfish 将会把主应用根路径+应用激活路径传递给子应用，子应用将其作为自己的基础路径，这样便会保证主子应用路由正常，例如： + 主应用根路径为`http://gar.byted.com/gar-example`，子应用激活路径为`/app1`，子应用将会在`provider`中接收到`http://gar.byted.com/gar-example/app1`，子应用将其将其作为基础路径，在上面变更路由
   :::

## router.push

`router.push({ path: string, query?: Record<string, string> }) : void`<br />

想要导航到不同的 URL，则使用 `router.push` 方法。这个方法会向 `history` 栈添加一个新的记录，所以，当用户点击浏览器后退按钮时，则回到之前的 `URL`。

### 注意点

- 如果有在 `Garfish.run` 时配置，`basename`。将在跳转时增加 `basename` 作为跳转前缀。
- 使用 `Garfish` 提供的路由方法，在已经打开子应用的场景下跳转对应子应用的子路由会触发组件更新
  > 在非 `Garfish` 微前端环境，直接使用 `history.pushState` 跳转路由是不会触发对应路由的组件更新的，原因在于 `vue` 和 `react` 不是监听路由变化和触发组件更新
- 本 `api` 可以在 `react-router-prompt` 触发多次时，配合 `autoRefreshApp` 配置。关闭其他跳转方法触发子应用刷新组件，可限制 `prompt` 触发多次或子应用额外卸载多次的场景。
- `autoRefreshApp` 选项关闭后，可以只能通过 `Garfish.router` 跳转子应用路由

### 示例

```html
<a onclick="Garfish.router.push({path: '/vue-a'})">Vue A</a>
<a onclick="Garfish.router.push({path: '/vue-b'})">Vue B</a>
<a onclick="Garfish.router.push({path: '/vue-a/todo'})">Vue A sub route</a>
<a onclick="Garfish.router.replace({path: '/react2'})">react2</a>
<a onclick="Garfish.router.push({path: '/error'})">error path</a>
```

## router.replace

`router.replace({ path: string, query?: Record<string, string> }) : void`

跟 `router.push` 很像，唯一的不同就是，它不会向 `history` 添加新记录，而是跟它的方法名一样，替换掉当前的 `history` 记录。

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

:::danger 注意点：

- 将路由守卫注册放在 `Garfish.run` 前执行，否则将无法接收到首次加载是的路由钩子。
- 若使用了路由守卫，请确保 `next` 函数被执行，否则将会阻塞路由内部加载逻辑。
  :::
