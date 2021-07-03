# `@garfish/remote-module`

## Usage

```jsx
// Modules
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
  esModule,
  setExternal,
  loadModule,
  loadModuleSync,
  cacheModules,
} from '@garfish/remote-module';

// Environment variables required by remoteModules
setExternal({ React });

React.lazy(() =>
  loadModule('https://xx.js').then((modules) => {
    console.log(modules); // One, Two
    return esModule(modules.One);
  }),
);

// Or
loadModule({
  cache: true, // This will cache the module instance
  env: { React },
  url: 'https://xx.js',
  error: (err) => {
    console.error(err);
    return 'render error content';
  },
}).then((modules) => {
  console.log(modules); // One, Two
});

// Or load the remote modules synchronously
preload(['https://1.js', 'https://2.js']).then(() => {
  const modules = loadModuleSync('https://1.js');
  console.log(modules); // One, Two
});

// View already cached modules
console.log(cacheModules);
```

## Combined with garfish

If you are using "garfish" micro frontend.

```jsx
// Child app
import {
  preload,
  setExternal,
} from '@garfish/remote-module';

export const provider = () => {
  render({ dom }) {
    // When the resources of the remote module are preloaded,
    // You can use synchronous syntax to load remote modules in the current application.
    // You can combine "webpack5 module federation" or other "module markets"
    preload(menu.remoteModules).then(() => {
      ReactDom.render(<App/>, dom)
    })
  },

  destroy() {
    ...
  }
}
```

You can also configure the information of remote modules in the template, so that these modules can be used synchronously when the child application is initialized.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- Preload Module resources, but will not execute code -->
    <meta
      name="garfish-remote-module"
      src="http://localhost:3000/remoteModule1.js"
    />
    <!-- With the async attribute will not block page rendering -->
    <meta
      name="garfish-remote-module"
      src="http://localhost:3000/remoteModule2.js"
      async
    />
  </head>
  <body></body>
</html>
```

```tsx
import { loadModuleSync } from '@garfish/remote-module';

function App() {
  const { OneModule } = loadModuleSync('https://xx.js');

  return (
    <div>
      <OneModule />
    </div>
  );
}
```
