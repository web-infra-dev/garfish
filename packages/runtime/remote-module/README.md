# `@garfish/remote-module`

`@garfish/remote-module` can be used alone or combined with Garfish.

## Usage

```js
// module
const React = require('React');

exports.One = function (props) {
  return React.createElement('div', null, [props.text]);
};

exports.Two = function () {
  return React.createElement('span');
};
```

```jsx
import React from 'React';
import {
  preload,
  esModule,
  loadModule,
  loadModuleSync,
  setModuleExternal,
  cacheModules,
} from '@garfish/remote-module';

// Environment variables required by remoteModules
setModuleExternal({ React });

const RemoteCm = React.lazy(() =>
  loadModule('https://xx.js').then((modules) => {
    console.log(modules); // One, Two
    return esModule(modules.One);
  }),
);

// Use `React.Suspense` to use components
<React.Suspense fallback={<div>loading</div>}>
  <div>
    <RemoteCm text="good!" />
  </div>
</React.Suspense>;
```

Other usage

```js
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

## Combined with Garfish

If you are using "garfish" micro frontend.

```jsx
// Child app
import {
  preload,
  setModuleExternal,
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

```jsx
import { loadModuleSync } from '@garfish/remote-module';

function App() {
  const { OneModule } = loadModuleSync('http://localhost:3000/remoteModule1');

  return (
    <div>
      <OneModule />
    </div>
  );
}
```

# Alias

You can simplify the long url with the `setModuleAlias` method.

```js
import { loadModule, setModuleAlias } from '@garfish/remote-module';

setModuleAlias('utils', 'http://localhost:3000/remoteModule');

loadModule('@RemoteModule:utils').then((utils) => {
  console.log(utils);
});

loadModule('@RemoteModule:utils.isObject').then((isObject) => {
  console.log(isObject);
});
```
