---
title: props
slug: /api/attributes/props
order: 2
---

`Garfish.props` is used to get the public content passed by the main application, to use shared data, or to pass specified content to child applications. Can be used with [mobx](https://cn.mobx.js.org).

### Master application shared data

```js
import Garfish from 'garfish';
import { observable, computed, action } from 'mobx';

class Store {
  @observable price = 0;
  @observable counter = 1;

  @computed get total() {
    return this.price * this.counter;
  }

  @action.bound
  increment() {
    this.counter++;
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

### Sub-application fetching data

```js
const store = window.Garfish.props.store;
const price = store.price;
const counter = store.counter;
store.increment();
```

### Or get it in the provider

```js
export function provider({ dom, basename, store }) {
  return {
    render() {},
    destroy() {},
  };
}
```
