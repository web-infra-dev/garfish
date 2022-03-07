# `@garfish/es-module`

[![NPM version](https://img.shields.io/npm/v/@garfish/es-module.svg?style=flat-square)](https://www.npmjs.com/package/@garfish/es-module)

Inspired by [virtual-es-module](https://github.com/imtaotao/virtual-es-module).

## Usage

```js
import Runtime from '@garfish/es-module';
// One runtime, one project
const runtime = new Runtime();

const module = await runtime.importByUrl('./a.mjs');
console.log(module);

const module = await runtime.importByCode(`
  import * as m from './a.mjs';
  export default 1;
`);
console.log(module);
```

## Use in Garfish

`@garfish/es-module` will bring serious above-the-fold performance problems, child applications should not use `esModule` in production environments.

```js
import { GarfishEsModule } from '@garfish/es-module';

Garfish.run({
  ...
  plugins: [
    ...
    GarfishEsModule({
      excludes: ['appName'],
    }),
  ],
})
```
