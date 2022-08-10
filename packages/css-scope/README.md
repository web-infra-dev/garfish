# `@garfish/css-scope`

[![NPM version](https://img.shields.io/npm/v/@garfish/css-scope.svg?style=flat-square)](https://www.npmjs.com/package/@garfish/css-scope)

Inspired by [reworkcss/css](https://github.com/reworkcss/css).

> [TJ](https://github.com/tj) is my idol.

## Usage

> Need webAssembly support

```js
import { parse, stringify } from '@garfish/css-scope';

const code = 'a { color: #fff; }';
const ast = parse(code);
const scopedCode = stringify(ast, 'App'); // #App a { color: #fff; }
```

## Use in Garfish

```js
import { GarfishCssScope } from '@garfish/css-scope';

Garfish.run({
  ...
  plugins: [
    GarfishCssScope({
      fixBodyGetter: true,
      excludes: ['appName'],
    }),
  ],
})
```
