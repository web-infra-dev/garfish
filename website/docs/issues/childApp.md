---
title: 子应用报错
slug: /issues
order: 1
---

## 推荐配置

如果在接入子应用的时候，出现了拿不到子应用导出的问题的时候。可以先按照以下步骤自查：

1. 检查子应用是否正确 `export` 了 `provider`。
2. 检查子应用是否配置了 `webpack` 的 `output` 配置。
3. 若为 `js` 入口，需要保证子应用的资源被打包成了但 `bundle`，若有部分依赖未被打包成 `bundle` 会导致无法正常加载

```js
// webpack.config.js
{
  output: {
    libraryTarget: 'umd',
  },
}
```

3. 由于 `webpackjsonp` 可能会冲突，所以可以给子应用和主应用配置不同的 `webpackjsonp`函数。
   :::note
   [webpack5 不需要这个配置](https://webpack.js.org/blog/2020-10-10-webpack-5-release/#automatic-unique-naming)
   :::

```js
// 主应用 webpack.config.js
{
  output: {
    jsonpFunction: 'masterWebpackJsonp',
  },
}
```

```js
// 子应用A webpack.config.js
{
  output: {
    globalObject: 'window',
    jsonpFunction: 'appAWebpackJsonp',
  },
}

```

```js
// 子应用B webpack.config.js
{
  output: {
    globalObject: 'window',
    jsonpFunction: 'appBAWebpackJsonp',
  },
}
```

这个问题后续我们会致力于在框架层面去规避，让用户无感知。

## webpack 5

- 配置 `injectClient`，否则 webpack 5 默认 `exports` 的是这个 `client`
- webpack-dev-server 需要升级到 `4.0.0-beta.1` 以上

![image.png](https://p-vcloud.byteimg.com/tos-cn-i-em5hxbkur4/170af76e7e7f41199b610d0ff252585a~tplv-em5hxbkur4-noop.image?width=1316&height=574)

![image.png](https://p-vcloud.byteimg.com/tos-cn-i-em5hxbkur4/08ccaa4185114155bc423ac64795c3c7~tplv-em5hxbkur4-noop.image?width=2186&height=882)
