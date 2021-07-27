---
title: Old application transformation
slug: /issues/oldApp
order: 3
---

## How to access sub-applications of an already existing `SPA` application

### Scenario Description

- Many `SPA` applications that need to be transformed into micro front ends are old applications that already exist.
- It may be necessary to gradually disassemble some of the routes within the application and turn them into sub-applications.
- How the existing routes of the main application coexist with the micro front-end route driver is commonly encountered during the migration process.

### How to transform step by step (using `react` as an example)

1. add `id` as a mount point for `micro-app`, set aside for subapplication mount, and the content of `Router` section is for other routes of the main application.
2. Add the `Router` content to be empty when the main application matches the subapplication route prefix.
3. When configuring the subapplication list, the prefix when the `Router` content is empty is used as the subapplication activation condition prefix.

The root component of the main application.

```jsx
<BrowserRouter getUserConfirmation={getConfirmation}>
  <RootContext.Provider value={provider}>
    <Header />
    <div className="container">
      <Router routes={routes} />
      <div id="micro-app" />
    </div>
  </RootContext.Provider>
</BrowserRouter>
```

routes.

```js
export default [
  {
    path: '/platform/search',
    component: Search,
  },
  {
    // Applications starting with /platform/micro-app are not displayed in Router
    path: '/platform/micro-app',
    component: function () {
      return null;
    },
  },
  {
    component: Home,
  },
];
```

Main entry point.

```js
Garfish.run({
  domGetter: '#micro-app',
  basename: '/platform/micro-app',
  apps: [
    ...
  ],
});
```
