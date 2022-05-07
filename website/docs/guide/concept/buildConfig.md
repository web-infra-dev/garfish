---
title: 构建配置
slug: /guide/build-config
order: 7
---

在 **「快速开始」** 章节可以发现，`Garfish` 针对不同的构建工具：`webpack`、`vite` 都要求其配置一些构建配置，那么这些构建配置分别在 `Garfish` 微前端应用中起到什么作用呢，「构建配置」这一章节主要是希望能够给帮助你了解背后这些构建配置带来的作用，下面的内容主要以 `webpack` 构建配置为例：

```js
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

## libraryTarget

在构建配置中通过 `libraryTarget` 可以将项目的产物分别构建成不同规范的产物：`umd`、`commonjs` 等规范的产物，实际 `Garfish` 希望子应用导出的是 `commonjs` 的产物，但是为了避免后续 `Garfish` 采用其他规范的产物，因此通常让微前端子应用构建成 `umd` 的产物，那么 `Garfish` 为什么希望子应用导出的是 `commonjs` 的产物呢？主要是解决两个问题：

1. 获取 `provider` 渲染协议
2. 进行依赖注入和共享

为什么设置为 `commonjs` 协议后，`Garfish` 框架能够获取 `provider` 协议和进行依赖注册和共享呢，这一切都要从 `commonjs` 的规范讲起，如果了解过 `commonjs` 实现原理的一定对下面这段代码非常熟悉：

```js
let code = `(function(exports,require,module,__dirname,__filename){

})`;
vm.runInThisContext(fn).call(module.exports, module.exports, req, module);
```

在 `node` 环境中拥有 `exports`、`require` ... 这几个全局环境变量，通过这些环境能够完成模块的加载，完成内容的导出和载入，那么同时也能够利用 `commonjs` 的机制在代码运行时注入 `exports`、`require` 环境变量从而实现控制子应用获取依赖和拿到子应用导出内容的目的

```js
// 实际代码
let code = ``;
new Function('require', 'exports', code)(fakeRequire, fakerExports);
```

## globalObject

`globalObject` 的配置主要与 `Garfish` 的 `sandbox` 执行代码的机制有关，可以参考 [沙箱机制的异常 case 逃逸](./sandbox.md#特殊-case)

## jsonpFunction

> webpackjsonp 是什么？

`webpack` 使用 `webpackjsonp` 来解决分 chunk 之后的加载问题。

`webpackjsonp` 是一个全局变量，用于存储 chunk 的信息。

如下图：

> `jsonpFunction` 配置的作用

`jsonpFunction` 的配置主要也与沙箱的机制有关， `Garfish` 的沙箱子应用的执行上下文 `window` 主要来自于主应用，当主应用与子应用都是用相同的 `key` 作为子应用 `jsonp` 存储 `chunk` 的方式时，子应用的 `chunk` 可能会受到主应用和其他应用的影响，因此通过 `jsonpFunction` 配置能够避免应用间的 `chunk` 互相应用

## publicPath

通过 `publicPath` 配置将微前端子应用的资源路径转换成绝对路径，为什么需要降子应用的资源路径转换成绝对路径呢？

- 子应用在独立运行时，使用相对路径的接口时，接口请求的路径是，当前页面域名+相对路径
- 但是在主应用时，子应用使用相对路径的接口，请求的路径按道理来说还是，当前域名+相对路径

当在微前端的场景下如果 `Garfish` 让子应用走「当前域名+相对路径」会发生更多的异常请求（`hmr` 热更新、`websocket`、`server worker` ...），因为子应用的域名并不一定是与主应用一致，因此 `Garfish` 框架会对相对路径的资源和请求去进行修正，修正的参照物为基础域名为子应用的路径，在本地开发时可能是正常的，但是发到线上出现问题，原因在于发布到线上之后，子应用的入口有可能会走 `CDN`。因此参照的基础路径就变为了 CDN 前缀。那么此时子应用的相对路径请求就变为了 `CDN` 前缀。这一块做了很对权衡，因为 `hmr`、`websocket`、`server worker` 这些内容可能难以被用户控制，所以默认走的还是修正模式。
