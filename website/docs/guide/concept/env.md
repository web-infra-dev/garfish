---
title: 环境变量
slug: /runtime/env.md
order: 8
---

### window.**GARFISH**

用于子应用判断当前是否处于微前端环境中。
如，在子应用入口处。增加子应用独立运行时逻辑：

```ts
if (!window.__GARFISH__) {
  ReactDOM.render(
    <RootComponent basename="/" />,
    document.querySelector('#root'),
  );
}
```

### **GARFISH_EXPORTS**
