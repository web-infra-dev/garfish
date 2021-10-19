# `@garfish/loader`

[![NPM version](https://img.shields.io/npm/v/@garfish/loader.svg?style=flat-square)](https://www.npmjs.com/package/@garfish/loader)

## Usage

```js
import { Loader } from '@garfish/loader';

const loader = new Loader({
  maxSize: 1024 * 1024 * 15, // default number is "1024 * 1024 * 15"
});

loader.hooks.usePlugin({
  name: 'test-plugin1',

  beforeLoad({ url, config }) {
    // You can changed the request config
    if (url.includes('xx')) {
      url = url.replace('xx', '');
    }
    return { url, config };
  },

  loaded(data) {
    const { result, value } = data;
    data.n = 1;
    return data;
  },
});

loader.hooks.usePlugin({
  name: 'test-plugin2',

  loaded(data) {
    console.log(data.n); // 1
    // The "data.value" will be cached this time.
    // So, you can transform the request result.
    return data;
  },
});

loader.load('appName', 'https://xxx').then((result) => {
  console.log(result); // 2
});
```

## Clear cache

```js
const loader = new Loader();

loader.clear('appName'); // Clear all cached resources under "appName"
loader.clear('appName', 'js'); // Clear all "js" cache resources under "appName"

loader.clearAll(); // Clear all cached resources
loader.clearAll('css'); // Clear all "css" cached resources
```
