---
title: Garfish.setExternal
slug: /api/setExternal
order: 6
---

`Garfish.setExternal` 用于实现应用间的依赖共享，通过该函数将依赖进行注册，注册完成后可以实现主子应用的依赖共享，但可能会由于共享带来某些依赖的影响，若出现问题建议关闭共享。

### 示例

> 主应用

```js
// 主应用 webpack 配置
module.exports = {
  output: {
    // 需要配置成 umd 规范
    libraryTarget: 'umd',
    // 请求确保该值与子应用的值不相同避免与子应用发生影响
    jsonpFunction: 'main-app-jsonpFunction',
  },
};

// 主应用 index.js
import Vue from 'vue';
import Garfish from 'garfish';

Garfish.setExternal('vue', Vue);
```

> 子应用

```js
// 主应用 webpack 配置
module.exports = {
  output: {
    // 需要配置成 umd 规范
    libraryTarget: 'umd',
    // 修改不规范的代码格式，避免逃逸沙箱
    globalObject: 'window',
    // 请求确保每个子应用该值都不相同，否则可能出现 webpack chunk 互相影响的可能
    jsonpFunction: 'vue-app-jsonpFunction',
    // 保证子应用的资源路径变为绝对路径，避免子应用的相对资源在变为主应用上的相对资源，因为子应用和主应用在同一个文档流，相对路径是相对于主应用而言的
    publicPath: 'http://localhost:8000',
  },

  externals: {
    vue: 'vue',
  },
};
```
