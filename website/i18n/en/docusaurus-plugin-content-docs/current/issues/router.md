---
title: routing problem
slug: /issues/router
order: 4
---

The main application routing is currently only supported in `history` mode, the `basename` of the child application routing is based on the main application, please refer to [child application basename configuration](/api/#basename) for details.

## Why does the main application only support history mode?

- Garfish currently uses namespaces to avoid routing conflicts between applications.

- The reason why the main application only supports `history` mode is that `hash` routes cannot be used as the base routes for child applications, which may lead to route conflicts between the main application and child applications.

## Why can't the root route be used as an activation condition for a child application?

- Some businesses want to use the root route as the activation condition of the sub-application, for example `garfish.bytedance.com` triggers the rendering of the sub-application. Since the activation condition of the current sub-application **string is the shortest match principle**, if the sub-application `activeWhen: '/'` indicates that `'/xxx'` will be activated.

- The reason for the shortest match principle is that we need to determine if a child route of a child application is active, and if it is likely to be a child route of a child application, we may activate that application.

- The reason for this restriction is that if the activation condition of a child application is `/`, then `/xx` of that application may be a child route of another child application, which may cause conflicts with other applications and cause confusion.

## What is the basename that the child application render function gets and what does it do?

Why is it recommended that the sub-application take the `basename` passed through the `provider` as the `basename` of the sub-application, some business parties directly add `basename` to the sub-application by agreement in the actual process to achieve the effect of isolation, but the use of this method may lead to the main application if the change `basename` may cause the sub-application can not be isolated. basename` may cause the child application can not be changed together to take effect.

For example

1. the main application currently visits `garfish.bytedance.com` to access the site's home page, the current `basename` is `/`, the sub-application vue, the access path is `garfish.bytedance.com/vue`

2. if the main application wants to change `basename` to `/site`, the access path of the main application becomes `garfish.bytedance.com/site` and the access path of the child vue becomes `garfish.bytedance.com/site/vue`. 3.

3. So it is recommended that the sub-application use the `basename` passed in the `provider` as the base route for its own application, to ensure that the relative path of the sub-application still matches the overall change after the main application changes its route

:::note
In micro front-end scenario, each sub-application may have its own routing scenario. To ensure that the routes between sub-applications do not conflict, the Garfish framework uses the configured `basename` + `sub-application's activeWhen` matching path as the sub-application's base path.

- If `basename: /demo` is configured on Garfish and the active path of the child application is: `/vue2`, then the child application gets the active path as: `/demo/vue2`

- If the activation condition of the sub-application is a function, each time a route change occurs, the activation function of the sub-application will be verified by checking that the function returns `true`, which means that the current activation condition is met and will trigger the activation of the route.

- Garfish will pass the current path into the activation function to get the longest activation path of the sub-application, and pass `basename` + `longest activation path of the sub-application` to the sub-application parameters

- **Sub-applications that have their own routes must use basename as the base path for the sub-application in a micro front-end scenario, without which the sub-application's routes may conflict with the main application and other applications**
  :::
