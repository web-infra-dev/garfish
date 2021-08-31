# `@garfish/hooks`

> TODO: description

## Usage

```js
import { PluginSystem, SyncHook } from '@garfish/hooks';

const hooks = new PluginSystem({
  a: new SyncHook(),
});

hooks.lifecycle.a.emit(1, 2);
```
