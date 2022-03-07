---
title: Garfish.setOptions
slug: /api/setOptions
order: 5
---

`Garfish.setOptions` 是用于动态更新应用配置的 `API`，`setOptions` 的值与 `run` 的参数一致，为了保证应用参数在运行过程中混乱不一致的情况，在触发了 `run` 方法后，不可以再通过 `setOptions` 更改应用配置

### 示例

```js
// 主应用 index.js
import Garfish from 'garfish';

Garfish.setOptions({
  basename: '/',
  domGetter: '#container',
  // xxx
});
```

### 参数

`Options`

<a href="/api/run">与 run 参数一致</a>
