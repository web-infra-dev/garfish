<p align="center">
  <img src="https://lf3-static.bytednsdoc.com/obj/eden-cn/dhozeh7vhpebvog/open-garfish/garfish-icon.png" width="300" alt="garfish" />
</p>

## Garfish

Garfish 是一个微前端框架，主要用于解决现代 web 应用在前端生态繁荣和 web 应用日益复杂化两大背景下带来的跨团队协作、技术体系多样化、应用日益复杂化等问题，并且 Garfish 已经经过大量的线上应用的打磨和测试，功能稳定性和可靠性强。

> Garfish 目标

将多个独立交付的前端应用组成整体，将前端应用分解成一些更小、更简单的能够「独立开发」、「独立测试」、「独立部署」的应用，而在用户看来仍然是内聚的单个产品。

## 文档

[https://bytedance.github.io/garfish/](https://bytedance.github.io/garfish/)

## 快速开始

1. 安装

```bash
$ yarn add garfish   #或者 npm i garfish -S
```

2. 使用

```javascript
import Garfish from 'garfish';

Garfish.run({
  domGetter: '#subApp',
  apps: [
    {
      name: 'vueApp',
      activeWhen: '/vueApp',
      entry: 'http://localhost:9000',
    },
    {
      name: 'reactApp',
      activeWhen: '/reactApp',
      entry: 'http://localhost:8000',
    },
  ],
});
```

## 功能

- 多技术体系共存
- 运行时沙箱
- 子应用独立开发部署
- 资源预加载
- 丰富多样的插件系统

## LICENSE

Garfish is released under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).
