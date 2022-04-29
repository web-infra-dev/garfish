---
title: Garfish.channel
slug: /api/channel
order: 5
---

import Highlight from '@site/src/components/Highlight';

用于应用间的通信，`Garfish.channel` 为 Garfish 的实例属性，该属性是 [EventEmitter2](https://github.com/EventEmitter2/EventEmitter2) 的实例。

### Type

```ts
channel: EventEmitter2;
```

### 默认值

- 无

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
