---
title: Garfish.setOptions
slug: /api/setOptions
order: 5
---

在 `Garfish.run` 调用前用于动态更新配置信息的API，参数与 [Garfish.run](/api/run) 保持一致。

`Garfish.setOptions` 是用于动态更新应用配置的 `API`，`setOptions` 的值与 `run` 的参数一致，为了保证应用参数在运行过程中混乱不一致的情况，在触发了 `run` 方法后，不可以再通过 `setOptions` 更改应用配置

## 设计初衷
在某些场景下，微前端应用的初始化参数信息在运行过程中可能会出现混乱不一致的情况，提供该 `API` 用于用户在复杂场景下设置全局微前端应用参数信息，此 API 作用于全局 Garfish 实例。

:::info
`Garfish.setOptions` 用于微前端应用启动前的参数变更。若微前端应用已处于运行态(触发了 `Garfish.run`)，请勿使用该 API 更新运行参数。
:::

## 示例

```js
// 主应用 index.js
import Garfish from 'garfish';

Garfish.setOptions({
  basename: '/',
  domGetter: '#container',
  // xxx
});
```

## 参数

`Options`

- 此 API 参数与 [Garfish.run](/api/run) 保持一致。 请参考 [Garfish.run](/api/run#参数)；
