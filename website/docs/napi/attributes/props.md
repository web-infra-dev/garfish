---
title: props
slug: /napi/attributes/props
order: 2
---

`Garfish.props` 用于获取主应用传递过来的公共内容，用起共享数据，或传递指定内容给子应用。可与 [mobx](https://cn.mobx.js.org) 搭配使用。

### 主应用共享数据

```js
import Garfish from 'garfish';
import { observable, computed, action } from 'mobx';

class Store {
  @observable price = 0;
  @observable amount = 1;

  @computed get total() {
    return this.price * this.amount;
  }

  @action.bound
  increment() {
    this.amount++;
  }
}

Garfish.run({
  basename: basePath,
  domGetter: '#subModule',
  apps,
  props: {
    store: new Store(),
  },
});
```

### 子应用获取数据

```js
const store = window.Garfish.props.store;
const price = store.price;
const amount = store.amount;
store.increment();
```

### 或者在 provider 中获取

```js
export function provider({ dom, basename, store }) {
  return {
    render() {},
    destroy() {},
  };
}
```
