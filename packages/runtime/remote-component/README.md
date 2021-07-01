# `@garfish/remote-component`

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
  preload,
  setExternal,
  loadComponent,
  loadComponentSync,
  cacheComponents,
} from '@garfish/remote-component';

// Environment variables required by microComponents
setExternal({ React });

loadComponent('https://xx.js').then((components) => {
  console.log(components); // One, Two
});

// Or
loadComponent({
  cache: true, // This will cache the component instance
  env: { React },
  url: 'https://xx.js',
  error: (err) => {
    console.error(err);
    return 'render error content';
  },
}).then((components) => {
  console.log(components); // One, Two
});

// Or load the micro components synchronously
preload(['https://1.js', 'https://2.js']).then(() => {
  const components = loadComponentSync('https://1.js');
  console.log(components); // One, Two
});

// View already cached components
console.log(cacheComponents);
```

## Combined with garfish

If you are using "garfish" micro frontend.

```jsx
// Child app
import {
  preload,
  setExternal,
} from '@garfish/remote-component';

if (window.__GARFISH__) {
  setExternal(window.Garfish.externals);
}

export const provider = () => {
  render({ dom }) {
    // When the resources of the micro component are preloaded,
    // You can use synchronous syntax to load micro components in the current application.
    // You can combine "webpack5 module federation" or other "component markets"
    preload(menu.microComponents).then(() => {
      ReactDom.render(<App/>, dom)
    })
  },

  destroy() {
    ...
  }
}
```

```tsx
import { loadComponentSync } from '@garfish/remote-component';

function App() {
  const { OneComponent } = loadComponentSync('https://xx.js');

  return (
    <div>
      <OneComponent />
    </div>
  );
}
```
