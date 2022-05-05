---
title: 环境变量
slug: /guide/env
order: 3
---

有时候需要使用环境变量（Environment Variables）以按需控制 `Garfish` 的行为，或者通过环境变量来区分微前端的子应用是否在微前端环境下运行，已进行一些兼容性逻辑的处理，下面来看看如何使用环境变量来控制 `Garfish` 的行为。

## 环境变量列表

| 名称                 | 描述                                                       | 使用场景                                                                      |
| -------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `window.__GARFISH__` | 在引入 `garfish` 包后， `window.__GARFISH__` 为 `true`     | 主要让子应用在校验是否处于微前端环境，因此建议子应用不要单独引入 `garfish` 包 |
| `window.Garfish`     | 在引入 `garfish` 包后， `window.Garfish` 为 `Garfish` 实例 | 可以使用 `Garfish` 实例上的方法，子应用也可使用该变量                         |

<!-- | `__GARFISH_EXPORTS__` | 子应用在运行时可以获得该环境变量，需要注意的是 `__GARFISH_EXPORTS__` 是环境变量而不是存储在 `window` 上的变量，直接使用 `__GARFISH_EXPORTS__` | 可用于导出 `provider` 渲染函数，而避免收到其他库的影响                        | -->

## 使用场景

### `window.__GARFISH__`

用于子应用判断当前是否处于微前端环境中。
如：在子应用入口处。增加子应用独立运行时逻辑：

```ts
if (!window.__GARFISH__) {
  ReactDOM.render(
    <RootComponent basename="/" />,
    document.querySelector('#root'),
  );
}
```

### `window.Garfish`

使用 `Garfish` 的路由进行路由跳转

```ts
window.Garfish.router.push({ path: '/test' });
```
