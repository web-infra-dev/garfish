---
title: Garfish 缓存机制
slug: /runtime/cache
order: 3
---

## Garfish 缓存机制


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

