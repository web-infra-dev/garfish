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

- [single-spa](https://github.com/single-spa/single-spa) for community raised a hot wave of micro front-end solutions, learned a lot of amazing Garfish bridge system design ideas.
