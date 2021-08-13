---
title: loadApp
slug: /api/attributes/loadApp
order: 5
---

### Garfish.loadApp(appName: string, opts?: LoadAppOptions)

- Parameters
  - appName - unique id of the application, required, id name of the child application
  - opts - `LoadAppOptions` - optional, configure sub-application related configuration (the parameters are basically the same, the only difference is one more `cache` parameter, if there is no configured parameter, it will be downgraded to use the global `options`)
    - domGetter - `Element | ()=> Element` - optional, will use Garfish.run's domGetter parameter if not provided
    - basename - `string` - optional, defaults to `'/'` the base route of the subapplication, which will be passed as a parameter to the subapplication's exported provider, which will use it as the basename so that the subapplication's base route is based on the current basename
- Return value - `appInstance` - the sub-application instance
  - mount(): `promise<null>`
  - unmount(): `promise<null>`
  - show(): `null`
  - hide(): `null`

### Caution

This is a specific usage note for `Garfish`'s manual loading scheme. `Garfish` manual loading is the core mechanism for rendering the entire sub-application. It is mainly implemented through the `Garfish.loadApp` api.
The following are the two loading cases.

:::note Caution

1. If you want to use manual load mode, you should turn off the `autoRefreshApp` mode of the route to avoid interference with the route driver. 2.
2. If you use manual loading, make sure you have `snapshot` set to `false` and `vm` sandbox turned on, otherwise the linear law based on snapshot sandbox will cause side effects to be cleared accidentally.
3. Manually loaded sub-applications need to be registered in advance using `Garfish.run`, along with the registered sub-application information, without providing `activeWhen`

``js
Garfish.run({
sandbox: {
open: true,
snapshot: false,
},
apps: [
{
name: 'vueApp',
entry: 'xxx',
},
],
autoRefreshApp: false,
});

````4.

4. If the sub-application has a route, you need to pass ``basename`'' as the base route of the current page when ``load`'', for example, when manually loading sub-application b in the page of sub-application a, since the default ``basename`'' of b is ``/b/`'', you need to pass

```js
Garfish.loadApp('vueApp', { basename: '/vueApp' });
````

:::

### Manual loading scheme without caching.

```js
// options is optional, if not passed, a deep copy will be made from Garfish.options by default
const app = await Garfish.loadApp('appName', {
  domGetter: () => document.getElementById('id'),
});

// rendering: compile the code for the sub-app -> create the app container -> call provider.render to render
const success = await app.mount();
// unload: clear the side effects of the child application -> call provider.destroy -> destroy the application container
const success = await app.unmount();
```

### Manual loading scheme that requires caching (caching is recommended)

```js
const cache = true;
const app = await Garfish.loadApp('appName', {
  domGetter: () => document.getElementById('id'),
});

// Render
if (cache && app.mounted) {
  const success = app.show();
} else {
  const success = await app.count();
}
// unload
const success = app.hide();
```

### What does app.mount do

1. create the `app` container and add it to the document stream
2. compile the code of the sub-app
3. get the `provider` of the child application
4. call the `app.options.beforeMount` hook
5. call `provider.render` 6.
6. set `app.display` and `app.counted` to `true`
7. set `app` to `Garfish.activeApps`
8. Call the `app.options.afterMount` hook
   > If the rendering fails, `app.mount` will return `false`, otherwise it will return `true` if the rendering succeeds, you can do the corresponding processing according to the return value.

### What events does app.unmount do

1. call the `app.options.beforeUnmount` hook
2. call `provider.destroy`
3. clear the side effects of the compilation
4. remove the container for `app` from the document stream
5. set `app.display` and `app.counted` to `false`
6. remove the current `app` instance from `Garfish.activeApps`
7. Call the `app.options.afterUnmount` hook
   > As above, you can determine if the uninstall was successful based on the return value.

### What events does app.show do?

1. add the container for `app` to the document stream
2. call `provider.render` 3.
3. set `app.display` to `true`
   > As above, you can determine whether the rendering was successful based on the return value.

### What events does app.hide do

1. call `provider.destroy` 2.
2. remove the container of `app` from the document stream
3. set `app.display` to `false`
   > As above, you can determine if hiding is successful based on the return value.

### Caching

Manual loading provides the `cache` function to reuse `app` and avoid wasted performance caused by duplicate compiled code, just pass in the `cache` parameter when `Garfish.loadApp`.

For example, the following code.

```js
const app1 = await Garfish.loadApp('appName', {
  cache: true,
});

const app2 = await Garfish.loadApp('appName', {
  cache: true,
});

console.log(app1 === app2); // true
```

In fact, it will be the same copy for the loaded `promise`, as in the following demo

```js
const promise1 = Garfish.loadApp('appName', {
  cache: true,
});

const promise2 = Garfish.loadApp('appName', {
  cache: true,
});

console.log(promise1 === promise2); // true

const app1 = await promise1;
const app2 = await promise2;
console.log(app1 === app2); // true
```
