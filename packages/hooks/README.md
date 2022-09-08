# `@garfish/hooks`

[![NPM version](https://img.shields.io/npm/v/@garfish/hooks.svg?style=flat-square)](https://www.npmjs.com/package/@garfish/hooks)

## Usage

```js
import { AsyncHook, PluginSystem } from '@garfish/hooks';

const hooks = new PluginSystem({
  a: new AsyncHook(),
});

hooks.usePlugin({
  async a(a, b) {
    console.log(a, b);
  },
});

hooks.lifecycle.a.emit(1, 2);
```

Inherit parent hooks.

```js
import { AsyncHook, PluginSystem } from '@garfish/hooks';
const hooks1 = new PluginSystem({
  a: new AsyncHook(),
});
const hooks2 = new PluginSystem({
  b: new AsyncHook(),
});
hooks2.inherit(hooks1);
hooks2.lifecycle.a.emit();
```
