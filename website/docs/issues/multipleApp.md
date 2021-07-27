---
title: 多个 Garfish 实例
slug: /issues/multipleApp
order: 2
---

## 非嵌套场景下

- 非嵌套场景下，子应用请勿在安装引入 Garfish 包，并导入使用。
- 子应用如果想要在微前端场景下使用 Garfish 包的相关能力，可判断在微前端环境内时，通过 `window.Garfish` 使用相关接口。

```js
if (window.__GARFISH__) {
  window.Garfish.xx;
}
```

## 嵌套场景

- Garfish 目前内部的设计都支持嵌套场景，如果业务对这一块有诉求可以使用，协助我们一起推进在嵌套场景下的能力。
