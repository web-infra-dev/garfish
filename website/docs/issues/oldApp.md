---
title: 旧应用改造
slug: /issues/oldApp
order: 3
---

## 已经存在的 `SPA` 应用如何接入子应用

### 场景描述

- 很多需要改造成微前端的 `SPA` 应用，都是已经存在的旧应用。
- 可能需要逐步拆解应用内的部分路由，变为子应用。
- 主应用现有路由如何与微前端路由驱动共存，是迁移过程中常遇到的。

### 如何逐步改造（以 `react` 为例）

1. 增加 `id` 为 `micro-app` 的挂载点，预留给子应用挂载，`Router` 部分的内容为主应用其他路由。
2. 主应用增加匹配到子应用路由前缀时，`Router` 内容为空。
3. 配置子应用列表时以 `Router` 内容为空时的前缀作为子应用激活条件前缀。

主应用的根组件：

```jsx
<BrowserRouter getUserConfirmation={getConfirmation}>
  <RootContext.Provider value={provider}>
    <Header />
    <div className="container">
      <Router routes={routes} />
      <div id="micro-app" />
    </div>
  </RootContext.Provider>
</BrowserRouter>
```

routes：

```js
export default [
  {
    path: '/platform/search',
    component: Search,
  },
  {
    // 以 /platform/micro-app 开头的应用Router都不展示内容
    path: '/platform/micro-app',
    component: function () {
      return null;
    },
  },
  {
    component: Home,
  },
];
```

主入口处：

```js
Garfish.run({
  domGetter: '#micro-app',
  basename: '/platform/micro-app',
  apps: [
    ...
  ],
});
```
