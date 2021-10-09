# `garfish`

[![NPM version](https://img.shields.io/npm/v/garfish.svg?style=flat-square)](https://www.npmjs.com/package/garfish)

## Usage

```js
import GarfishInstance from 'garfish';

GarfishInstance.run({
  domGetter: '#AppContainer',
  apps: [
    {
      name: 'app',
      entry: 'xx.html',
      activeWhen: '/index',
    },
  ],
});
```
