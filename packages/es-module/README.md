# `@garfish/es-module`

[![NPM version](https://img.shields.io/npm/v/@garfish/es-module.svg?style=flat-square)](https://www.npmjs.com/package/@garfish/es-module)

Inspired by [virtual-es-module](virtual-es-module).

## Usage

```js
import Runtime from '@garfish/es-module';

const runtime = new Runtime({
  // options
});

runtime.asyncImport('./a.mjs').then((module) => {
  console.log(module);
});
```
