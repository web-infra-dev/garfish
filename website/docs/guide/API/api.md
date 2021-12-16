---
title: 概览
slug: /api
order: 1
---

Garfish 是 `garfish` 默认导出的实例（字节内部用户可使用 `@byted/garfish` 包）， Garfish 主要的 API 都在 Garfish 实例上，通过 Garfish 实例可以完成对微前端整个应用的管理。

## Garfish 实例方法

- [Garfish.run](/api/run) （可以用于初始化应用参数，并启动路由监听能力，当路由发生变化时自动激活应用和销毁应用）
- [Garfish.registerApp](/api/registerapp)（用于动态注册应用信息）
- [Garfish.loadApp](/api/loadapp)（可以手动控制子应用加载和销毁）
- [Garfish.router](/api/router)（提供路由跳转和路由守卫能力）
- [Garfish.channel](/api/channel)（提供应用间通信的能力）
- [Garfish.setExternal](/api/setexternal)（支持应用间的依赖共享）
- [Garfish.getGlobalObject](/api/getglobalobject)（用于获取真实 Window）
