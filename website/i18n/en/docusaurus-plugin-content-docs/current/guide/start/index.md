---
title: Garfish Introduction
slug: /guide
order: 1
---

# About Garfish

## What is Garfish

Garfish originated from the actual scenario of [headline](http://mp.toutiao.com), which turned into a Monolithic-Applications ([boulder-application](https://en.wikipedia.org/wiki/Monolithic \_application), while the team personnel maintaining them are scattered and the project is large, leading to low development and debugging efficiency and difficulties in going online (code merging interdependencies), which becomes an important factor blocking business development.

So in 2018, Garfish, a micro front-end framework, was derived, and after a lot of validation and polishing of practical scenarios on the business side, Garfish gradually matured. With more business needs for micro front-end, Garfish is in the process of iteration and has accumulated rich experience in micro front-end problem solving.

Garfish is a set of micro front-end solution, mainly used to solve the problems of cross-team collaboration, technology system diversification, and web application complexity brought by modern web applications in the context of front-end ecological boom and web application increasing complexity. Garfish is a micro front-end solution for solving the problems of cross-team collaboration, diverse technology systems, and increasingly complex web applications.

## Framework Features

- 🌈 **Rich and efficient product features**

  - Garfish micro front-end sub-application supports any kind of framework and technology system access
  - Garfish micro front-end sub-application supports "independent development", "independent testing" and "independent deployment
  - Powerful pre-loading capability, automatically record user application loading habits to increase the loading weight, and greatly reduce the application switching time
  - Support dependency sharing, which greatly reduces the overall package size and the repeated loading of dependencies
  - Built-in data collection to effectively sense the state of the application during operation
  - Support for multiple instance capability, can run multiple sub-applications in the page at the same time to enhance the business splitting efforts
  - Provides efficient and available debugging tools to assist users in the micro front-end mode brings different development experience problems from the traditional R&D model

- 📦 **Highly scalable core module**

  - The Loader core module supports HTML entry and JS entry, making it easy to access micro front-end applications.
  - Router module provides route-driven, master-child route isolation, users only need to configure the routing table application can complete the independent rendering and destruction, the user does not need to care about the internal logic
  - Sandbox module provides runtime isolation for the application's Runtime, which can effectively isolate the side effects of JS and Style on the application
  - Store provides a set of simple communication data exchange mechanism

- 🎯 **Highly scalable plug-in mechanism** (coming soon...)

  - Provides business plugins to meet various customization needs of business parties

## Architecture Design

! [image.png](https://p-vcloud.byteimg.com/tos-cn-i-em5hxbkur4/d456c7d2235c41daa298aba69ade435f~tplv-em5hxbkur4-noop.image?width= 1126&height=454)

## When to use

If you have many team members, many types of projects, and want to make it a "cohesive single product:

- The project has team members from multiple teams
- Requirements crowding occurs in multiple iterations within the project, affecting testing and release efficiency
- Cross-space and cross-time dimensions lead to the inability to unify the technical system within the team
- Multiple front-end applications need to achieve the "single product with cohesion" feature
- Some parts of the "cohesive single product" want to achieve independent development, independent release, independent testing, independent grayscale and other capabilities
