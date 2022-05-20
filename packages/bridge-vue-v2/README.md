# `"@garfish/bridge-vue-v2`

[![NPM version](https://img.shields.io/npm/v/@garfish/bridge.svg?style=flat-square)](https://www.npmjs.com/package/@garfish/bridge)

Vue bridge for vue v2 subapp. For more details, [check here](https://www.garfishjs.org/guide/bridge)
## Usage

```js
// child app
import { vueBridge } from '@garfish/bridge-vue-v2';

function App() {
  return <div>content</div>;
}

export const provider = vueBridge({
  rootComponent: App,
  loadRootComponent: ({ basename, dom, appName, props }) => {
    // do something async
    return Promise.resolve(App);
  },
  handleInstance: (vueInstance, { basename, dom, appName, props }) => {
    // you can do something in handleInstance after get the vueInstance
  },
  appOptions: ({ basename, dom, appName, props }) => {
    // pass the options to Vue Constructor. check https://vuejs.bootcss.com/api/#%E9%80%89%E9%A1%B9-%E6%95%B0%E6%8D%AE
    return {
      el: '#app',
      router: newRouter(basename),
      store,
    };
  },
});

```
