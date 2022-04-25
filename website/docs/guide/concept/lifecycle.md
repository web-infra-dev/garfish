---
title: 生命周期
slug: /guide/lifecycle
order: 3
---

<img
  src="https://user-images.githubusercontent.com/27547179/165056974-f40d790e-3db1-4aea-b2db-5d3618a150d5.png"
  width="400"
/>

### mount

app.mount 做了哪些事情

1. 创建 `app` 容器并添加到文档流上
2. 编译子应用的代码
3. 拿到子应用的 `provider`
4. 调用 `app.options.beforeMount` 钩子
5. 调用 `provider.render`
6. 将 `app.display` 和 `app.mounted` 设置为 `true`
7. 将 `app` set 到 `Garfish.activeApps` 中
8. 调用 `app.options.afterMount` 钩子
9. 如果渲染失败，`app.mount` 会返回 `false`，否则渲染成功会返回 `true`，你可以根据返回值做对应的处理。

### unmount

app.unmount 做了哪些事件

1. 调用 `app.options.beforeUnmount` 钩子
2. 调用 `provider.destroy`
3. 清除编译的副作用
4. 将 `app` 的容器从文档流上移除
5. 将 `app.display` 和 `app.mounted` 设置为 `false`
6. 在 `Garfish.activeApps` 中移除当前的 `app` 实例
7. 调用 `app.options.afterUnmount` 钩子
8. 同上，可以根据返回值来判断是否卸载成功。

### show

app.show 做了哪些事件

1. 将 `app` 的容器添加到文档流上
2. 调用 `provider.render`
3. 将 `app.display` 设置为 `true`
4. 同上，可以根据返回值来判断是否渲染成功。

### hide

app.hide 做了哪些事件

1. 调用 `provider.destroy`
2. 将 `app` 的容器从文档流上移除
3. 将 `app.display` 设置为 `false`
4. 同上，可以根据返回值来判断是否隐藏成功。
