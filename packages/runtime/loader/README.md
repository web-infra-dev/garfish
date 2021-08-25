# `@garfish/loader`

## Usage

```js
import { Loader } from '@garfish/loader';

const loader = new Loader({
  maxSize: 10 * 1024 * 1024, // default number is "10 * 1024 * 1024"
});

// beforeLoad
loader.lifecycle.beforeLoad.add(({ url, config }) => {
  // You can changed the request config
  if (url.includes('xx')) {
    url = url.replace('xx', '');
  }
  return { url, config };
});

// loaded
loader.lifecycle.loaded.add((data) => {
  const { result, value } = data;
  data.n = 1;
  return data;
});

loader.lifecycle.loaded.add((data) => {
  console.log(data.n); // 1
  // The "data.value" will be cached this time.
  // So, you can transform the request result.
  return data;
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
