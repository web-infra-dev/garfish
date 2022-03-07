# `@garfish/css-scope`

[![NPM version](https://img.shields.io/npm/v/@garfish/es-module.svg?style=flat-square)](https://www.npmjs.com/package/@garfish/es-module)

Inspired by [reworkcss/css](https://github.com/reworkcss/css).

There are two implementations of this scheme, one depends on the browser platform, uses some dom APIs, and the other uses a pure parser process, which is suitable for scenarios such as ssr.

We temporarily use the second option.

## Usage

```js
import { parse, stringify } from '@garfish/css-scope';

const text = `a { color: #fff; }`;
const ast = parse(text);
const scopedText = stringify(ast, '#App'); // #App a { color: #fff; }
```
