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
  setModuleConfig,
  cacheModules,
} from '@garfish/remote-module';

setModuleConfig({
  externals: { React }, // Environment variables required by remoteModules
  alias: { Component: 'https://xx.js' },
});

const RemoteCm = React.lazy(() =>
  loadModule('https://xx.js').then((modules) => {
    console.log(modules); // One, Two
    return esModule(modules.One);
  }),
);

// Or
const RemoteCm = React.lazy(() => {
  return loadModule('@Component.One').then(esModule);
});

// Use `React.Suspense` to use components
<React.Suspense fallback={<div>loading</div>}>
  <div>
    <RemoteCm text="cool!" />
  </div>
</React.Suspense>;
```

Other usage

```js
// Or
loadModule('https://xx.js', {
  cache: true, // This will cache the module instance, default value is `true`
  externals: { React },
  error: (err, info, alias) => {
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
import { preload } from '@garfish/remote-module';

export const provider = () => {
  render({ dom }) {
    // When the resources of the remote module are preloaded,
    // You can use synchronous syntax to load remote modules in the current application.
    // You can combine "webpack5 module federation" or other "component markets"
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
      alias="Component"
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
  // const One = loadModuleSync('@Component.One');
  const { One } = loadModuleSync('http://localhost:3000/remoteModule1');

  return (
    <div>
      <One />
    </div>
  );
}
```

# Alias

You can simplify the long url with the `alias` config.

```js
import { loadModule, setModuleConfig } from '@garfish/remote-module';

setModuleConfig({
  alias: { utils: 'http://localhost:3000/remoteModule' },
});

loadModule('@utils').then((utils) => {
  console.log(utils);
});

loadModule('@utils.isObject').then((isObject) => {
  console.log(isObject);
});
```

# Remote module

The remote module only supports the `commonjs` format, but you can also package the module in the `umd` format.

```js
module.exports = {
  a() {},
  b() {},
};
```

If the module wants to return asynchronous content.

> When the module exports a promise, you can only use the `RemoteModule.loadModule` method, otherwise an error will be reported.

```js
// The loadModule method is provided by default
const loadModule = require('loadModule');

module.exports = new Promise((resolve) => {
  loadModule('@otherModules').then((modules) => {
    resolve({
      a() {},
      b() {},
      ...modules,
    });
  });
});
```
