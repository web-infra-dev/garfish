<div align="center">
  <img src="https://lf3-static.bytednsdoc.com/obj/eden-cn/dhozeh7vhpebvog/open-garfish/icons/Garfish-icon-Square.png" width="300" alt="garfish" />
</div>

<div align="center">

[![NPM version](https://img.shields.io/npm/v/garfish.svg?style=flat-square)](https://www.npmjs.com/package/garfish) [![build status](https://github.com/modern-js-dev/garfish/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/modern-js-dev/garfish/actions/workflows/ci.yml)

</div>

<div align="center">

English | [简体中文](./README.ch.md)

</div>

<h1></h1>

Garfish is a micro front-end framework, mainly used to solve the problems of cross-team collaboration, diversification of technology system, and increasing complexity of applications brought by modern web applications in the context of front-end ecological boom and increasing complexity of web applications, and Garfish has been polished and tested by a large number of online applications, with strong functional stability and reliability.

> Garfish Goals

To compose multiple independently delivered front-end applications into a whole, and to decompose front-end applications into some smaller and simpler applications that can be "independently developed", "independently tested" and "independently deployed", while still appearing to users as cohesive individual products.

## Installation

```bash
# npm
npm install garfish

# yarn
yarn add garfish
```

## Documentation

> The doc site ([Garfish](https://garfish.top/)) is only available in Chinese for now, we are planning to add English versions soon.

- [About Garfish](https://garfish.top/guide)
- [Quick Start](https://garfish.top/quick-start)
- [API References](https://garfish.top/api)

## Functionality

🌈 Rich and efficient product features

- Garfish micro front-end sub-application supports any kind of framework and technology system access
- Garfish micro front-end sub-application supports "independent development", "independent testing" and "independent deployment
- Powerful pre-loading capability, automatically record user application loading habits to increase loading weight, and greatly reduce application switching time
- Support for dependency sharing, which greatly reduces the overall package size and the repeated loading of dependencies.
- Support data collection, effectively perceive the state of the application during operation
- Support for multiple instance capability to run multiple sub-applications in the page at the same time enhances the business splitting efforts
- Provides efficient and usable debugging tools to assist users in the micro front-end model brings different development experience problems from the traditional R&D model

📦 Highly scalable core modules

- Supports HTML entry and JS entry through the Loader core module, making it easy to access micro front-end applications
- Router module provides route-driven, master-child route isolation, users only need to configure the routing table application can complete the independent rendering and destruction, the user does not need to care about the internal logic
- Sandbox module provides runtime isolation for the application's Runtime, which can effectively isolate the side effects of JS and Style on the application
- Store provides a simple mechanism for exchanging communication data

🎯 Highly scalable plugin mechanism (coming soon...)

- Provide business plugins to meet various customization needs of business parties


## credit

- [Qiankun](https://github.com/umijs/qiankun) is a very good micro front-end framework, Garfish sandbox design learned a lot of good ideas
- [single-spa](https://github.com/single-spa/single-spa) for community raised a hot wave of micro front-end solutions, learned a lot of amazing Garfish routing system design ideas
