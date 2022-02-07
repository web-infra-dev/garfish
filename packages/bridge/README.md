# `@garfish/bridge`

[![NPM version](https://img.shields.io/npm/v/@garfish/bridge.svg?style=flat-square)](https://www.npmjs.com/package/@garfish/bridge)

## Usage

```jsx
// child app
import React from 'react';
import ReactDOM from 'react-dom';
import { reactBridge } from '@garfish/bridge';

function App() {
  return <div>content</div>;
}

reactBridge({
  React,
  ReactDOM,
  el: '#root',
  rootComponent: App,
});
```
