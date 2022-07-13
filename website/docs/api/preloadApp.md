---
title: Garfish.preloadApp
slug: /api/preloadApp
order: 4
---
import Highlight from '@site/src/components/Highlight';


`Garfish.preloadApp` 用于预加载特定资源，通过 `Garfish.preloadApp` 可以预加载特定子应用的入口资源和入口资源内容的子资源


## `Garfish.preloadApp`


### Type
```ts
interface Garfish {
  preloadApp: PreLoadAppType;
}

type PreLoadAppType = (appName: string)=> void
```

#### 参数
- <Highlight>appName</Highlight>
- 要加载的子应用名称，在调用 `preloadApp` 时，必须保证子应用信息已注册

#### 示例

```ts
import Garfish from 'garfish';

Garfish.register({
  name: 'react',
  entry: 'http://localhost:3000'
});

// 预加载 react 子应用的入口资源和子资源（子资源表示的是，html 中携带的 script 和 link 信息）
Garfish.preloadApp('react');

```
#### 说明

1. 该 `API` 可以用于在未真正加载子应用时进行子应用的资源预加载，当资源加载成功时，真正加载子应用时将不会再发起资源请求，将直接独立内存中存储的静态资源
2. 通常可以将 `preloadApp` 的资源加载提升到主应用的 `html` 阶段，可以保证首屏使用到的子应用资源能够最大程度的提前完成资源的请求处理

