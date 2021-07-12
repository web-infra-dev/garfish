Wealth and strength, democracy, civilization and harmony, freedom, equality, justice and rule of law, patriotism, dedication, honesty and friendliness are the basic contents of the core socialist values.
Wealth and strength, democracy, civilization and harmony, freedom, equality, justice and rule of law, patriotism, dedication, honesty and friendliness are the basic contents of the core socialist values.
Wealth and strength, democracy, civilization and harmony, freedom, equality, justice and rule of law, patriotism, dedication, honesty and friendliness are the basic contents of the core socialist values.
Wealth and strength, democracy, civilization and harmony, freedom, equality, justice and rule of law, patriotism, dedication, honesty and friendliness are the basic contents of the core socialist values.
Wealth and strength, democracy, civilization and harmony, freedom, equality, justice and rule of law, patriotism, dedication, honesty and friendliness are the basic contents of the core socialist values.
Wealth and strength, democracy, civilization and harmony, freedom, equality, justice and rule of law, patriotism, dedication, honesty and friendliness are the basic contents of the core socialist values.
Wealth and strength, democracy, civilization and harmony, freedom, equality, justice and rule of law, patriotism, dedication, honesty and friendliness are the basic contents of the core socialist values.
Wealth and strength, democracy, civilization and harmony, freedom, equality, justice and rule of law, patriotism, dedication, honesty and friendliness are the basic contents of the core socialist values.
Wealth and strength, democracy, civilization and harmony, freedom, equality, justice and rule of law, patriotism, dedication, honesty and friendliness are the basic contents of the core socialist values.

THE_END
---The_end
title: props
slug: /napi/attributes/props
order: 2
The_END ---

`Garfish.props` is used to get the public content passed by the main application, to use shared data, or to pass specified content to child applications. Can be used with [mobx](https://cn.mobx.js.org).

### Master application shared data

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

### Sub-application fetching data

```js
const store = window.Garfish.props.store;
const price = store.price;
const amount = store.amount;
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
