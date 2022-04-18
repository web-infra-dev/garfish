---
title: Garfish.getGlobalObject
slug: /api/getGlobalObject
order: 7
---

用于获取真实 window 的值。
在 `Garfish` 默认启动了沙箱的隔离能力，所以在子应用中全局变量默认是隔离的，通过该方法可以读取真实 window 的值。一般情况下并不建议用户直接使用该 API，若子应用要获取真实的 window 上的环境变量，可考虑将其加入 `protectVariable` 列表中

### 示例

```js
import Garfish from 'garfish';

const nativeWindow = Garfish.getGlobalObject();
```

## setGlobalValue

用于设置真实 window 的值。
在 `Garfish` 中默认启动了沙箱的隔离能力，所以在子应用中全局变量默认是隔离的，通过该方法可以读取真实 window 的值。一般情况下并不建议用户直接使用该 API，若子应用要获取真实的 window 上的环境变量，可考虑将其加入 `protectVariable` 列表中

### 示例

```js
import Garfish from 'garfish';

Garfish.setGlobalValue(key: string | symbol, value: any);
```

## clearEscapeEffect

若发现有一些特殊的行为会逃逸沙箱系统，可以使用此方法来清除逃逸的变量

### 示例

```js
Garfish.clearEscapeEffect('webpackJsonp');
```
