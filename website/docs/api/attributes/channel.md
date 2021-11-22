---
title: channel
slug: /api/attributes
order: 1
---

`Garfish.channel` 用于应用之间的通信。他有着与 `node evnets(v11.13.0)` 模块相同的 [api](https://nodejs.org/dist/v11.13.0/docs/api/events.html)。

> 实际上 `Garfish` 也是继承自 `EventEmitter` 类，但是仅仅供内部使用，如果你是在开发插件，使用 `Garfish.props` 来进行通信。

```js
Garfish.channel.on('event', function (a, b) {
  console.log(a, b); // 'a', 'b'
  console.log(this === Garfish.channel); // true
});

Garfish.channel.emit('event', 'a', 'b');
```

### 子应用监听登录事件

```js
const App = () => {
  const handleLogin = (userInfo) => {
    console.log(`${userInfo.name} has login`);
  };

  useEffect(() => {
    window.Garfish.channel.on('login', handleLogin);
    return () => {
      window.Garfish.channel.removeListener('login', handleLogin);
    };
  });
};
```

### 主应用触发登录事件

```js
api.getLoginInfo.then((res) => {
  if (res.code === 0) {
    window.Garfish.channel.emit('login', res.data);
  }
});
```
