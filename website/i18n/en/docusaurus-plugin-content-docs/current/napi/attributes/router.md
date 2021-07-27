---
title: router
slug: /napi/attributes/router
order: 3
---

Provides routing-related capabilities in micro front-end scenarios.

> It is recommended to use `Garfish.router` as the `api` for switching sub-applications, switching between applications is also possible via `vue-router` or `react-router`, but it will cause exceptions in some special scenarios: [react-router-prompt triggered multiple times](https://code.byted.org/pgcfe/gar/issues/5)

:::note Notes.

1. currently the main application only supports `history` mode to automatically mount the sub-application, you can configure `activeWhen` as a function activation condition to activate the main application as a `hash` mode application

2. When both the main application and the sub-application have routes, please convert the main application to `history` mode (since Garfish does not currently isolate the sub-application routes from the main application routes)

   - Since the main application routing and sub-application are in the same routing execution environment, if the main application is `hash` routing and the sub-application is `history` routing, the routing will not comply with the specification
   - After the main application enters the detail page, the address is `http://gar.byted.com#/gar-example/detail`, after loading the sub-application as history, the route becomes `http://gar.byted.com/app1#/gar-example/detail`. 3.

3. Currently Garfish isolates the routing between applications by `basePath` to avoid routing conflicts like the above between the main application and the child application. `http://gar.byted.com/gar-example`, the child application activation path is `/app1`, the child application will receive `http://gar.byted.com/gar-example/app1` in the `provider`, the child application will use it as its base path, change the path
   :::

## router.push

`router.push({ path: string, query?: Record<string, string> }) : void`<br />

To navigate to a different URL, use the `router.push` method. This method adds a new record to the `history` stack, so that when the user clicks the browser back button, it goes back to the previous `URL`.

### Points to note

- If there is a `basename` configured at the time of `Garfish.run`. will add `basename` as a jump prefix when jumping.
- Using the routing methods provided by `Garfish`, jumping to a sub-route corresponding to a sub-application in a scenario where the sub-application is already open will trigger a component update
  > In a non-Garfish micro front-end environment, jumping a route directly using `history.pushState` will not trigger a component update for the corresponding route, because `vue` and `react` are not listening for route changes and triggering component updates
- This `api` can be configured with `autoRefreshApp` when `react-router-prompt` is triggered multiple times. Turning off other jump methods to trigger child app refresh components limits the scenario where `prompt` triggers multiple times or the child app unloads additional times.
- With the `autoRefreshApp` option turned off, you can only route the application through the `Garfish.router` hopper

### Example

```html
<a onclick="Garfish.router.push({path: '/vue-a'})">Vue A</a
<a onclick="Garfish.router.push({path: '/vue-b'})">Vue B</a
<a onclick="Garfish.router.push({path: '/vue-a/todo'})">Vue A sub route</a
<a onclick="Garfish.router.replace({path: '/react2'})">react2</a
<a onclick="Garfish.router.push({path: '/error'})">error path</a
```

## router.replace

`router.replace({ path: string, query?: Record<string, string> }) : void`

Much like `router.push`, the only difference is that it doesn't add a new record to `history`, but rather replaces the current `history` record, just like its method name.

## router.beforeEach

`router.beforeEach(to: RouterInfo, from: RouterInfo, next: Function): void`

Triggered after a route jump and before a child application is mounted.

```ts
interface RouterInfo {
  fullPath: string;
  path: string;
  query: Object;
  matched: Array<AppInfo>;
}
```

Each guard method takes three parameters

- `to` Information about the target route that is coming in.
- `from` The information about the route that is about to leave.
- `next` The blocking execution callback.

``js
Garfish.router.beforeEach((to, from, next) => {
// console.log(to, from);
next();
})

Garfish.router.afterEach((to, from, next) => {
// console.log(to, from);
next();autoRefreshApp
})

Garfish.run(...) ;

```

## router.afterEach

`router.afterEach(to: RouterInfo, from: RouterInfo, next) : void`

Much like `router.afterEach`, the only difference is that it is triggered after the route is jumped and the child application is mounted.

## Route Guard

As the name suggests, the navigation guard is provided mainly to guard the navigation by jumping or canceling. In a micro front-end environment, when jumping routes, the route guard will block the rendering of the sub-application when the `next` function is not called.

> but cannot block route hops within a subapplication, because route hops within a subapplication cannot be blocked by `Garfish`

:::danger Note.

- Put the route guard registration before `Garfish.run`, otherwise it will not receive the first loaded route hook.
- If you use a route guard, make sure the `next` function is executed, otherwise it will block the route's internal loading logic.
  :::
```
