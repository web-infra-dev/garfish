# `@garfish/es-module`

[![NPM version](https://img.shields.io/npm/v/@garfish/es-module.svg?style=flat-square)](https://www.npmjs.com/package/@garfish/es-module)

Inspired by [virtual-es-module](virtual-es-module).

## Usage

```js
import Runtime from '@garfish/es-module';
const runtime = new Runtime();

const module = await runtime.dynamicImport('./a.mjs');
console.log(module);

const module = await runtime.importByCode(`
  import * as m from './a.mjs';
  export default 1;
`);
console.log(module);
```

## Use in Garfish

```js
import { GarfishEsmModule } from '@garfish/es-module';

Garfish.run({
  ...,
  plugins: [
    ...,
    GarfishEsmModule({
      excludes: ['appName'],
    }),
  ],
})
```
