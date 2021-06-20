# `@garfish/vm-sandbox`

## Usage

```js
import vmSandbox from '@garfish/vm-sandbox';

let name = 'chen';

const sandbox = new vmSandbox({
  el: () => document.body,
  modules: [() => ({
    namespace: 'app',
    override: { name },
    recover() => {
      name = 'chen';
    },
  })]
})

sandbox.execScript(`
  window.x = 1;
  console.log(window.name); // chen
  window.name = 'tao';
`)

console.log(sandbox.global.x); 1
console.log(sandbox.global.name); // tao

// Clear effect
sandbox.clearEffect();
console.log(name); // chen
```
