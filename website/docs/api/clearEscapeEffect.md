---
title: Garfish.clearEscapeEffect
slug: /api/clearEscapeEffect
order: 9
---

用来清除逃逸沙箱的变量。

> 在微前端应用下，子应用将默认开启沙箱模式。在沙箱模式下，若发现有一些特殊的行为会逃逸沙箱系统，可以使用此方法来清除逃逸的变量；

## Type
```ts
clearEscapeEffect: (key: string, value?: any) => void;
```

## 示例

```js
Garfish.clearEscapeEffect('webpackJsonp');
```
