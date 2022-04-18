---
title: Garfish.channel
slug: /api/channel
order: 5
---

用于应用间的通信。它是 [EventEmitter2](https://github.com/EventEmitter2/EventEmitter2) 的实例

### 示例

```js
// 子应用监听登录事件
const App = () => {
  const handleLogin = (userInfo) => {
    console.log(`${userInfo.name} has login`);
  };

  useEffect(() => {
    window?.Garfish.channel.on('login', handleLogin);
    return () => {
      window?.Garfish.channel.removeListener('login', handleLogin);
    };
  });
};

// 主应用触发监听事件
api.getLoginInfo.then((res) => {
  if (res.code === 0) {
    window.Garfish.channel.emit('login', res.data);
  }
});
```
