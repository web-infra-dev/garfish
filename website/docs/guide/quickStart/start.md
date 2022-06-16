---
title: 快速开始
slug: /guide/start
order: 2
---

import WebpackConfig from '@site/src/components/config/_webpackConfig.mdx';
import ViteConfig from '@site/src/components/config/_viteConfig.mdx';

本节分别从主、子 应用视角出发，介绍如何通过 [Garfish API](/api) 来将应用接入 Garfish 框架

:::tip 在线预览
<a href="https://stackblitz.com/edit/garfish-demo?file=react-sub%2Fsrc%2FApp.js"><img src="https://developer.stackblitz.com/img/open_in_stackblitz.svg" width="150"/></a>
:::

## 主应用

通过 Garfish API 接入主应用整体流程分为 2 步：

1. 添加 `garfish` 依赖包
2. 通过 `Garfish.run`，提供挂载点、basename、子应用列表

### 1.安装依赖

```bash npm2yarn
npm install garfish --save
```

### 2.注册子应用并启动 Garfish

```js
// index.js（主应用入口处）
import Garfish from 'garfish';
Garfish.run({
  basename: '/',
  domGetter: '#subApp',
  apps: [
    {
      name: 'react',
      activeWhen: '/react',
      entry: 'http://localhost:3000', // html入口
    },
    {
      name: 'vue',
      activeWhen: '/vue',
      entry: 'http://localhost:8080/index.js', // js入口
    },
  ],
});
```

当引入 Garfish 实例，执行实例方法 `Garfish.run` 后，`Garfish` 将会立刻启动路由劫持能力。

这时 `Garfish` 将会监听浏览器路由地址变化，当浏览器的地址发生变化时，`Garfish` 框架内部便会执行匹配逻辑，当解析到当前路径符合子应用匹配逻辑时，便会自动将应用挂载至指定的 `dom` 节点上，并在此过程中会依次触发子应用加载、渲染过程中的 [生命周期钩子函数](/guide/lifecycle).

:::tip 注意
请确保指定的节点存在于页面中，否则可能会导致出现 `Invalid domGetter "xxx"​` 错误。在 `Garfish` 开始渲染时，无法查询到该挂载节点则会提示该错误

> 解决方案

1. 将挂载点设置为常驻挂载点，不要跟随路由变化使子应用挂载点销毁和出现
2. 保证 Garfish 在渲染时挂载点存在
:::

如果你的业务需要手动控制应用加载，可以使用 [Garfish.loadApp](/api/loadApp.md) 手动加载 APP：

```typescript
// 使用 loadApp 动态挂载应用
import Garfish from 'garfish';
const app = await Garfish.loadApp('vue-app', {
  domGetter: '#container',
  entry: 'http://localhost:3000',
  cache: true,
});

// 若已经渲染触发 show，只有首次渲染触发 mount，后面渲染都可以触发 show 提供性能
app.mounted ? app.show() : await app.mount();
```

## 子应用

通过 Garfish API 接入子应用整体流程分为 3 步：

1. 调整子应用的构建配置(目前 Garfish 仅支持 umd 格式的产物)
2. 导出子应用生命周期
3. 设置应用路由 `basename`

### 1.调整子应用的构建配置

<Tabs>
  <TabItem value="Webpack" label="Webpack" default>

<WebpackConfig />

   </TabItem>
   <TabItem value="vite" label="Vite" default>

<ViteConfig />

  </TabItem>
</Tabs>

### 2.导出 provider 函数

> 针对子应用需要导出生命周期函数，我们提供了桥接函数 [`@garfish/bridge-react`](/guide/bridge) 自动包装应用的生命周期，使用`@garfish/bridge-react` 可以降低接入成本与用户出错概率，也是 garfish 推荐的子应用接入方式。

```bash npm2yarn
// 安装 @garfish/bridge-react：
npm install @garfish/bridge-react --save
```

<Tabs>
  <TabItem value="Webpack" label="使用 @garfish/bridge-react 接入" default>

```jsx
import { reactBridge } from '@garfish/bridge-react';

export const provider = reactBridge({
  el: '#root',
  rootComponent: RootComponent,
  errorBoundary: () => <Error />,
});
```

  </TabItem>
  <TabItem value="vite" label="自定义导出函数" default>

```tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom';

export const provider = () => ({
  // render 渲染函数，必须提供
  render: ({ dom, basename }) => {
    // 和子应用独立运行时一样，将子应用渲染至对应的容器节点，根据不同的框架使用不同的渲染方式
    ReactDOM.render(
      <React.StrictMode>
        <App basename={basename} />
      </React.StrictMode>,
      // 需要注意的一点是，子应用的入口是否为 HTML 类型（即在主应用的中配置子应用的 entry 地址为子应用的 html 地址），
      // 如果为 HTML 类型，需要在 dom 的基础上选中子应用的渲染节点
      // 如果为 JS 类型，则直接将 dom 作为渲染节点即可
      dom.querySelector('#root'),
    );
  },
  // destroy 应用销毁函数，必须提供
  destroy: ({ dom, basename }) => {
    // 使用框架提供的销毁函数销毁整个应用，已达到销毁框架中可能存在得副作用，并触发应用中的一些组件销毁函数
    // 需要注意的时一定要保证对应框架得销毁函数使用正确，否则可能导致子应用未正常卸载影响其他子应用
    ReactDOM.unmountComponentAtNode(
      dom ? dom.querySelector('#root') : document.querySelector('#root'),
    );
  },
});
```

  </TabItem>
</Tabs>

### 3. 设置应用路由 `basename`

```ts
// src/component/rootComponent
import React from "react";
import { BrowserRouter } from "react-router-dom";

const RootComponent = ({ basename }) => {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="/home" element={<Home />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

我们在 [接入指南](/guide/demo) 章节详细中介绍了各框架的子应用接入 Garfish 的 demo 案例及接入过程注意事项，目前提供了：

- react (version 16, 17, 18)
- vue (version 2, 3)
- vite (version 2)
- angular (version 13)

可移步 [接入指南](/guide/demo) 查看详细接入步骤。

## 总结

使用 Garfish API 搭建一套微前端主子应用的主要成本来自两方面

- 主应用的搭建
  - 注册子应用的基本信息
  - 使用 Garfish 在主应用上调度管理子应用
- 子应用的改造
  - 增加对应的构建配置
  - 使用 `@garfish/bridge-react` 包提供的函数包装子应用后返回 `provider` 函数并导出
  - 子应用针对不同的框架类型，添加不同 `basename` 的设置方式
    - React 在根组件中获取 `basename` 将其传递至 `BrowserRouter` 的 `basename` 属性中
    - Vue 将 `basename` 传递至 `VueRouter` 的 `basename` 属性中
