<div align="center">
  <img src="https://lf3-static.bytednsdoc.com/obj/eden-cn/dhozeh7vhpebvog/open-garfish/icons/Garfish-icon-Square.png" width="300" alt="garfish" />
</div>

<div align="center">

[![NPM version](https://img.shields.io/npm/v/garfish.svg?style=flat-square)](https://www.npmjs.com/package/garfish) [![build status](https://github.com/modern-js-dev/garfish/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/modern-js-dev/garfish/actions/workflows/ci.yml)

</div>

<div align="center">

[English](./README.md) | 简体中文

</div>

<h1></h1>

Garfish 是一套微前端解决方案，主要用于解决现代 web 应用在前端生态繁荣和 web 应用日益复杂化两大背景下带来的跨团队协作、技术体系多样化、应用日益复杂化等问题，Garfish 已经经过大量的线上应用的打磨和测试，功能稳定可靠。

> Garfish 目标

将多个独立交付的前端应用组成整体，将前端应用分解成一些更小、更简单的能够「独立开发」、「独立测试」、「独立部署」的应用，而在用户看来仍然是内聚的单个产品。

## 安装

```bash
# npm
npm install garfish

# yarn
yarn add garfish
```

## 文档

> 目前文档站点 ([Garfish](https://garfishjs.org/)) 仅提供了中文版本，不久后将提供英文版本文档

- [关于 Garfish](https://www.garfishjs.org/guide/quick-start/index.html)
- [快速开始](https://www.garfishjs.org/guide/quick-start/start.html)
- [API](https://garfishjs.org/api)

## 功能

🌈 丰富高效的产品特征

- Garfish 微前端子应用支持任意多种框架、技术体系接入
- Garfish 微前端子应用支持「独立开发」、「独立测试」、「独立部署」
- 强大的预加载能力，自动记录用户应用加载习惯增加加载权重，应用切换时间极大缩短
- 支持依赖共享，极大程度的降低整体的包体积，减少依赖的重复加载
- 支持数据收集，有效的感知到应用在运行期间的状态
- 支持多实例能力，可在页面中同时运行多个子应用提升了业务的拆分力度
- 提供了高效可用的调试工具，协助用户在微前端模式下带来的与传统研发模式不同带来的开发体验问题

📦 高扩展性的核心模块

- 通过 Loader 核心模块支持 HTML entry、JS entry 的支持，接入微前端应用简单易用
- Router 模块提供了路由驱动、主子路由隔离，用户仅需要配置路由表应用即可完成自主的渲染和销毁，用户无需关心内部逻辑
- Sandbox 模块为应用的 Runtime 提供运行时隔离能力，能有效隔离 JS、Style 对应用的副作用影响
- Store 提供了一套简单的通信数据交换机制

🎯 高度可扩展的插件系统

- 提供业务插件满足业务方的各种定制需求

## 贡献

- [贡献指南](https://github.com/modern-js-dev/garfish/blob/main/CONTRIBUTING.md)

## 感谢

- [Qiankun](https://github.com/umijs/qiankun) 是一款非常优秀的微前端框架，Garfish 的沙箱设计从中吸收了很多优秀的想法
- [single-spa](https://github.com/single-spa/single-spa) 为社区掀起了微前端解决方案的热潮，Garfish 路由系统设计从中吸取了很多令人惊叹的想法。在 Garfish Bridge 的设计中，我们参考了 [single-spa](https://github.com/single-spa/single-spa)  bridge 部分的设计实现，并且我们认为这是一个好的设计，所以我们 fork 了 [single-spa](https://github.com/single-spa/single-spa) bridge 部分的实现代码，且针对 Garfish 的生命周期函数做出了一些调整。
- Garfish 的 css-scope 插件灵感来自于[reworkcss](https://github.com/reworkcss/css)的实现，并且为了适用于不同的场景我们 fork 了一些  reworkcss 的实现代码
- Garfish 的 es-module 插件的设计灵感来自于[@babel/traverse](https://github.com/babel/babel)和[es-module-shims](https://github.com/guybedford/es-module-shims)库，一些实现部分的代码fork 自 @babel/traverse
