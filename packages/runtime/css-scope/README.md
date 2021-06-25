# `@garfish/css-scope`

> 简化了 [css](https://github.com/reworkcss/css) 这个库

这套方案有两种实现，一套依赖于浏览器平台，使用 dom 一些 api，一套走纯 parser 流程，适用于 ssr 等场景。

## Usage

```js
import { parse, stringify } from '@garfish/css-scope';

const text = `a { color: #fff; }`;
const ast = parse(text);
stringify(ast, '#App');
```
