# `@garfish/css-scope`

[![NPM version](https://img.shields.io/npm/v/@garfish/css-scope.svg?style=flat-square)](https://www.npmjs.com/package/@garfish/css-scope)

Inspired by [reworkcss/css](https://github.com/reworkcss/css).

There are two implementations of this scheme, one depends on the browser platform, uses some dom APIs, and the other uses a pure parser process, which is suitable for scenarios such as ssr.

We temporarily use the second option.

## Usage

> Need webAssembly support

```js
import { parse, stringify } from '@garfish/css-scope';

const code = 'a { color: #fff; }';
const ast = parse(code);
const scopedCode = stringify(ast, '#App'); // #App a { color: #fff; }
```

## Use in Garfish

```js
import { GarfishCssScope } from '@garfish/css-scope';

Garfish.run({
  ...
  plugins: [
    ...
    GarfishCssScope({
      excludes: ['appName'],
    }),
  ],
})
```
