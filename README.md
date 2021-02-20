<h1 align="center">
  Garfish
</h1>

[![npm version](https://badge.fury.io/js/%40garfish%2Fcore.svg)](https://badge.fury.io/js/%40garfish%2Fcore)

<p align="center">
  <img src="http://tosv.byted.org/obj/garfish/Garfish.png" width="150" alt="garfish" />
</p>

`Garfish` 是字节跳动内部自研的微前端框架，提供了从开发调试、服务注册和发现、部署上线、运行的完整解决方案，主要用于解决多团队协作的大型单体应用维护困难的问题。
> 目前在字节跳动内部有超过 60 个团队，300 个项目使用 Garfish。

## 安装
`$ npm i @garfish/core`

## 快速开始
```js
import Garfish from '@garfish/core';

Garfish.run({
  domGetter: '#AppContainer',
  apps: [
    {
      name: 'app',
      entry: 'xx.html',
      activeWhen: '/index',
    },
  ],
})
```

## 文档
+ [API](https://github.com/bytedance/garfish/wiki/API)
+ [Build](https://github.com/bytedance/garfish/wiki/Build)

## LICENSE
Garfish is released under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).
