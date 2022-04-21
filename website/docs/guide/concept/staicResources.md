---
title: 静态资源
slug: /runtime/staicResources
order: 7
---

## Garfish 静态资源

```ts
// webpack.config.js
{
  output: {
    // 需要配置成 umd 规范
    libraryTarget: 'umd',
    // 修改不规范的代码格式，避免逃逸沙箱
    globalObject: 'window',
    // 请求确保每个子应用该值都不相同，否则可能出现 webpack chunk 互相影响的可能
    // webpack 5 使用 chunkLoadingGlobal 代替，若不填 webpack 5 将会直接使用 package.json name 作为唯一值，请确保应用间的 name 各不相同
    jsonpFunction: 'vue-app-jsonpFunction',
    // 保证子应用的资源路径变为绝对路径，避免子应用的相对资源在变为主应用上的相对资源，因为子应用和主应用在同一个文档流，相对路径是相对于主应用而言的
    publicPath: 'http://localhost:8000',
  },
}
```
