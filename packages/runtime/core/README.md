# `@garfish/core`

> TODO: description

## Usage

```shell
$ yarn add @garfish/core @garfish/cjs-app @garfish/router @garfish/browser-vm @garfish/browser-snapshot
```

```js
import Garfish from '@garfish/core';
import GarfishRouter from '@garfish/router';
import GarfishBrowserVm from '@garfish/browser-vm';
import GarfishBrowserSnapshot from '@garfish/browser-snapshot';

const GarfishInstance = new Garfish({
  apps,
  plugins: [GarfishRouter(), GarfishBrowserVm(), GarfishBrowserSnapshot()],
});
```
