## 使用 Router

```js
import garfish from '@garfish/core';
import { listenRouter } from '@garfish/router';

const apps = [
  {
    name: 'appName',
    entry: ''，
    activeWith: '/detail',
  }
];

listenRouter({
  apps,
  active (appInfo, rootPath) {
     if (appInfo.active) return appInfo.active(appInfo, rootPath);
    const app = await garfish.loadApp(appInfo.name, {
      cache: true,
      basename: rootPath,
    });

    if (app !== null) {
      await app.mount();
      unmounts[appInfo.name] = () => app.unmount();
      return unmounts[appInfo.name];
    }
    return null;
  },
  deactive (appInfo, rootPath) {
    if (appInfo.deactive) return appInfo.deactive(appInfo, rootPath);
    const unmount = unmounts[appInfo.name];
    if (unmount) {
      await unmount();
    }
  }
});
```
