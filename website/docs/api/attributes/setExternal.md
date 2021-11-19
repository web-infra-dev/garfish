---
title: setExternal
slug: /api/attributes/setExternal
order: 4
---

`Garfish.setExternal(exts | name: string, value?: any)`

- `exts` `Externals: { name: string, value: any }`
  - `name` 应用公共模块
  - `value` 模块内容

:::note 注意点
目前资源共享能力，不会校验子应用间的包版本差异，在使用时需要保证共享资源之间的版本相同，否则可能会导致意外的异常场景，后续会增加版本校验等高级特性
:::

<br/>
<br/>

### 主应用 index.js

```js
import Vue from 'vue';
import Vuex from 'vuex';
import VueRouter from 'vue-router';
import Garfish from '@byted/garfish';

// 主应用共享组件
Garfish.setExternal({
  vue: Vue,
  vuex: Vuex,
  'vue-router': VueRouter,
});
```

### 子应用 webpack.config.js

```js
// 子应用，将不将共享的依赖打包进入源码，子应用将会使用主应用共享的模块。
module.exports = {
  externals: {
    vue: 'vue',
    vuex: 'vuex',
    'vue-router': 'vue-router',
  },
};
```
