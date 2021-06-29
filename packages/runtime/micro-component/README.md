# `@garfish/micro-component`

> TODO: description

## Usage

```jsx
// components
exports.One = function () {
  return React.createElement('div');
};

exports.Two = function () {
  return React.createElement('span');
};
```

```js
import React from 'React';
import {
  setExternal,
  preloadComponent,
  loadComponent,
  loadComponentSync,
} from '@garfish/micro-component';

// Environment variables required by microComponents
setExternal({ React });

loadComponent('https://xx.js').then((components) => {
  console.log(components); // One, Two
});

// Or
loadComponent({
  url: 'https://xx.js',
  env: { React },
  cache: true, // This will cache the component instance
  error: () => 'error content',
}).then((components) => {
  console.log(components); // One, Two
});

// Or load the micro components synchronously
preloadComponent(['https://1.js', 'https://2.js']).then(() => {
  const components = loadComponentSync('https://1.js');
  console.log(components); // One, Two
});
```
