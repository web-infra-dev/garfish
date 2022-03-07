# `@garfish/core`

[![NPM version](https://img.shields.io/npm/v/@garfish/core.svg?style=flat-square)](https://www.npmjs.com/package/@garfish/core)

## Usage

```shell
$ yarn add @garfish/core @garfish/cjs-app @garfish/router @garfish/browser-vm @garfish/browser-snapshot
```

```js
import Garfish from '@garfish/core';
import { GarfishRouter } from '@garfish/router';
import { GarfishBrowserVm } from '@garfish/browser-vm';
import { GarfishBrowserSnapshot } from '@garfish/browser-snapshot';

const GarfishInstance = new Garfish({
  apps,
  plugins: [GarfishRouter(), GarfishBrowserVm(), GarfishBrowserSnapshot()],
});
```

## loadApp

```js
import Garfish from '@garfish/core';
import { GarfishBrowserVm } from '@garfish/browser-vm';

const GarfishInstance = new Garfish({
  plugins: [GarfishBrowserVm()],
  beforeLoad: async (appInfo, options) => {
    // `return false` will prevent the app from loading
    // return false;
  },
  afterLoad: (appInfo, options) => {},
  beforeEval: (appInfo, code, env, url, options) => {},
  afterEval: (appInfo, code, env, url, options) => {},
  beforeMount: (appInfo, app) => {},
  afterMount: (appInfo, app) => {},
  beforeUnmount: (appInfo, app) => {},
  afterUnmount: (appInfo, app) => {},
  errorLoadApp: (err, appInfo) => console.error(err),
  errorMountApp: (err, appInfo) => console.error(err),
  errorUnmountApp: (err, appInfo) => console.error(err),
  errorExecCode: (err, appInfo) => console.error(err),
});

// `appName` is globally unique.
GarfishInstance.loadApp('appName', 'https://xx.html').then(async (app) => {
  if (!app) return;
  let mountSuccess;
  try {
    mountSuccess = await app.mount();
  } catch (e) {
    // If you add the `errorMountApp` hook, no error will be thrown here
    console.log(e);
  }

  if (mountSuccess) {
    document.body.appendChild(app.appContainer);
    // unmount
    setTimeout(() => {
      const unmountSuccess = app.unmout();
      console.log(unmountSuccess);
    }, 1000);
  }
});
```

You can also pass more complex parameters.

```js
GarfishInstance.loadApp('appName', {
  cache: true,
  entry: 'https://xx.html',
  domGetter: '#appContainer', // When the child application is rendered, it will be mounted here
}).then(async (app) => {
  if (!app) return;
  // ...
});
```
