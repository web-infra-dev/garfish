# `@garfish/bridge`

[![NPM version](https://img.shields.io/npm/v/@garfish/bridge.svg?style=flat-square)](https://www.npmjs.com/package/@garfish/bridge)

for more details, [check here](https://www.garfishjs.org/guide/bridge)
## Usage

```jsx
// child app
import React from 'react';
import ReactDOM from 'react-dom';
import { reactBridge } from '@garfish/bridge';

function App() {
  return <div>content</div>;
}

export const provider = vueBridge({
  rootComponent: App,
  loadRootComponent: ({ basename, dom, appName, props }) => {
    // do something async
    return Promise.resolve(App);
  },
  appOptions: ({ basename, dom, appName, props }) => {
    // pass the options to createApp. check hhttps://vuejs.org/api/application.html#createApp
    return {
      el: '#app',
      render: () => h(App),
    };
  },
  handleInstance: (vueInstance, { basename, dom, appName, props }) => {
    // you can do something in handleInstance after get the vueInstance
    vueInstance.use(newRouter(basename));
    vueInstance.provide(stateSymbol, createState());
  },
});


```

