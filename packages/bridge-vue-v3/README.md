# `@garfish/bridge-vue-v3`

[![NPM version](https://img.shields.io/npm/v/@garfish/bridge-vue-v3.svg?style=flat-square)](https://www.npmjs.com/package/@garfish/bridge-vue-v3)

Vue bridge for vue v3 subapp. For more details, [check here](https://www.garfishjs.org/guide/bridge)
## Usage

```jsx
// child app
import { vueBridge } from '@garfish/bridge-vue-v3';

function App() {
  return <div>content</div>;
}

export const provider = vueBridge({
  rootComponent: App,
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

## Contributing

- [Contributing Guide](https://github.com/modern-js-dev/garfish/blob/main/CONTRIBUTING.md)

## Credit

- [single-spa](https://github.com/single-spa/single-spa) for community raised a hot wave of micro front-end solutions, and we refer to the implementation of the bridge part in [single-spa](https://github.com/single-spa/single-spa) and we think it is a good design, so we fork the code of the bridge implementation part and make some adjustments for the lifecycles in Garfish.
