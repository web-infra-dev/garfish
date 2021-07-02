---
title: 手动加载
slug: /guide/advance/loadApp
order: 1
---

### Garfish.loadApp(appName: string, opts?: LoadAppOptions)

- 参数
  - appName - 应用唯一 id，必填，子应用的 id 名称
  - opts - `LoadAppOptions` - 可选，配置子应用相关配置（参数基本一致，唯一的区别是多了一个 `cache` 参数，如果没有配置的参数，会降级使用全局的 `options`）
    - domGetter - `Element | ()=> Element` - 可选，未提供时将使用 Garfish.run 的 domGetter 参数
    - basename - `string` - 选填，默认值为 `'/'` 子应用的基础路由，该参数将会作为参数传递到子应用导出的 provider 中，子应用将其作为 basename 以便于子应用的基础路由基于当前 basename
- 返回值 - `appInstance` - 子应用实例
  - mount(): `promise<null>`
  - unmount(): `promise<null>`
  - show(): `null`
  - hide(): `null`

### 注意事项

这是 `Garfish` 的手动加载方案的具体使用说明。`Garfish` 手动加载是整个子应用渲染的核心机制。主要是通过 `Garfish.loadApp` 这个 api 来实现。
下面是两种加载的 case：

:::note 注意事项

1. 如果要使用手动加载模式，为了避免与路由驱动干扰，你应该关掉路由的 `autoRefreshApp` 模式。
2. 如果使用手动加载，请确保你将 `snapshot` 设置为 `false`，打开了 `vm` 沙箱，否则基于快照沙箱的线性规律会导致副作用被意外清除。
3. 手动加载的子应用，需要提前使用 `Garfish.run` 进行注册，同时注册的子应用信息，不需要提供 `activeWhen`

```js
Garfish.run({
  sandbox: {
    open: true,
    snapshot: false,
  },
  apps: [
    {
      name: 'vueApp',
      entry: 'xxx',
    },
  ],
  autoRefreshApp: false,
});
```

4. 如果子应用有路由，需要在 `load` 的时候传入 `basename` 为当前页面的基础路由，如在子应用 a 的页面里手动加载子应用 b 时，由于 b 默认的 `basename` 是 `/b/`，所以 `load` 的时候需要

```js
Garfish.loadApp('vueApp', { basename: '/vueApp' });
```

:::

### 不需要缓存的手动加载方案：

```js
// options 是可选的，如果不传，默认会从 Garfish.options 上深拷贝一份过来
const app = await Garfish.loadApp('appName', {
  domGetter: () => document.getElementById('id'),
});

// 渲染：编译子应用的代码 -> 创建应用容器 -> 调用 provider.render 渲染
const success = await app.mount();
// 卸载：清除子应用的副作用 -> 调用 provider.destroy -> 销毁应用容器
const success = await app.unmount();
```

### 需要缓存的手动加载方案（推荐使用缓存）

```js
const cache = true;
const app = await Garfish.loadApp('appName', {
  domGetter: () => document.getElementById('id'),
});

// 渲染
if (cache && app.mounted) {
  const success = app.show();
} else {
  const success = await app.mount();
}
// 卸载
const success = app.hide();
```

### app.mount 做了哪些事情

1. 创建 `app` 容器并添加到文档流上
2. 编译子应用的代码
3. 拿到子应用的 `provider`
4. 调用 `app.options.beforeMount` 钩子
5. 调用 `provider.render`
6. 将 `app.display` 和 `app.mounted` 设置为 `true`
7. 将 `app` set 到 `Garfish.activeApps` 中
8. 调用 `app.options.afterMount` 钩子
   > 如果渲染失败，`app.mount` 会返回 `false`，否则渲染成功会返回 `true`，你可以根据返回值做对应的处理。

### app.unmount 做了哪些事件

1. 调用 `app.options.beforeUnmount` 钩子
2. 调用 `provider.destroy`
3. 清除编译的副作用
4. 将 `app` 的容器从文档流上移除
5. 将 `app.display` 和 `app.mounted` 设置为 `false`
6. 在 `Garfish.activeApps` 中移除当前的 `app` 实例
7. 调用 `app.options.afterUnmount` 钩子
   > 同上，可以根据返回值来判断是否卸载成功。

### app.show 做了哪些事件

1. 将 `app` 的容器添加到文档流上
2. 调用 `provider.render`
3. 将 `app.display` 设置为 `true`
   > 同上，可以根据返回值来判断是否渲染成功。

### app.hide 做了哪些事件

1. 调用 `provider.destroy`
2. 将 `app` 的容器从文档流上移除
3. 将 `app.display` 设置为 `false`
   > 同上，可以根据返回值来判断是否隐藏成功。

### 缓存

手动加载提供的了 `cache` 功能，以便复用 `app`，避免重复的编译代码造成的性能浪费，在 `Garfish.loadApp` 时，传入 `cache` 参数就可以。

 例如下面的代码：

```js
const app1 = await Garfish.loadApp('appName', {
  cache: true,
});

const app2 = await Garfish.loadApp('appName', {
  cache: true,
});

console.log(app1 === app2); // true
```

实际上，对于加载的 `promise` 也会是同一份，例如下面的 demo

```js
const promise1 = Garfish.loadApp('appName', {
  cache: true,
});

const promise2 = Garfish.loadApp('appName', {
  cache: true,
});

console.log(promise1 === promise2); // true

const app1 = await promise1;
const app2 = await promise2;
console.log(app1 === app2); // true
```
