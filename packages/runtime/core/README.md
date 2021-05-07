# `@garfish/core`

> TODO: description

## Usage

```
yarn add @garfish/core
yarn add @garfish/cjs-app
yarn add @garfish/router
yarn add @garfish/browser-vm
yarn add @garfish/browser-snapshot

import Garfish from '@garfish/core';
import GarfishRouter from '@garfish/router';
import BrowserVm from '@garfish/browser-vm';
import BrowserSnapshot from '@garfish/browser-snapshot';

let GarfishInstance = new Garfish({
  apps,
  plugins: [
    GarfishRouter(),
    BrowserVm(),
    BrowserSnapshot()
  ]
});

// TODO: DEMONSTRATE API
```
