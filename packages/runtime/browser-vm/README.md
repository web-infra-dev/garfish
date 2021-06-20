# `@garfish/vm-sandbox`

## Usage

```js
import vmSandbox from '@garfish/vm-sandbox';

let nameMap = { a: 'chen' };

const sandbox = new vmSandbox({
  el: () => document.body,
  modules: [
    () => ({
      namespace: 'app',
      override: { nameMap },
      recover() {
        nameMap = { a: 'chen' };
      },
    }),
  ],
});

sandbox.execScript(`
  window.x = 1;
  console.log(window.nameMap); // { a: 'chen' }
  window.nameMap.a = 'tao';
`);

console.log(sandbox.global.x); // 1
console.log(sandbox.global.nameMap); // { a: 'tao' }

// Clear effect
sandbox.clearEffects();
console.log(nameMap); // { a: 'chen' }

// If clear all effects
sandbox.reset();
```
