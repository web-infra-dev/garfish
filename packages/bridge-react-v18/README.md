# `@garfish/bridge-react-v18`

[![NPM version](https://img.shields.io/npm/v/@garfish/bridge-react-v18.svg?style=flat-square)](https://www.npmjs.com/package/@garfish/bridge-react-v18)

## Usage

```jsx
// child app
import { reactBridge } from '@garfish/bridge-react-v18';

function App() {
  return <div>content</div>;
}

export const provider = reactBridge({
  el: '#root',
  rootComponent: App,
});
```

## Contributing

- [Contributing Guide](https://github.com/modern-js-dev/garfish/blob/main/CONTRIBUTING.md)

## Credit

- [single-spa](https://github.com/single-spa/single-spa) for community raised a hot wave of micro front-end solutions, and we refer to the implementation of the bridge part in [single-spa](https://github.com/single-spa/single-spa) and we think it is a good design, so we fork the code of the bridge implementation part and make some adjustments for the lifecycles in Garfish.
