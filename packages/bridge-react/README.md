# `@garfish/bridge-react`

[![NPM version](https://img.shields.io/npm/v/@garfish/bridge-react.svg?style=flat-square)](https://www.npmjs.com/package/@garfish/bridge-react)

## Usage

```jsx
// child app
import { reactBridge } from '@garfish/bridge-react';
function App() {
  return <div>content</div>;
}
export const provider = reactBridge({
  el: '#root',
  rootComponent: App,
});
```
