# `@garfish/hooks`

> TODO: description

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
