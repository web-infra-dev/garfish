<p align="center">
  <img src="https://lf3-static.bytednsdoc.com/obj/eden-cn/dhozeh7vhpebvog/open-garfish/icons/Garfish-icon-Square.png" width="300" alt="garfish" />
</p>

English | [简体中文](./README.zh-CN.md)

## Garfish

Garfish is a micro front-end framework, mainly used to solve the problems of cross-team collaboration, diversification of technology system, increasing complexity of applications brought by modern web applications in the context of front-end ecological boom and increasing complexity of web applications, and Garfish has been polished and tested by a large number of online applications, with strong functional stability and reliability.

> Garfish Goals

Multiple independently delivered front-end applications is integrated into a whole，and front-end applications are disintegrated into some smaller and simpler applications that can be "independently developed", "independently tested" and "independently deployed", while still appearing to users as a single cohesive product.

## Documentation

<!-- [https://bytedance.github.io/garfish/](https://bytedance.github.io/garfish/) -->

[https://garfish.top/](https://garfish.top/)

## Quick Start

1. Installation

```bash
$ yarn add garfish # or npm i garfish -S
```

2. Use

```javascript
import Garfish from 'garfish';

Garfish.run({
  domGetter: '#subApp',
  apps: [
    {
      name: 'vueApp',
      activeWhen: '/vueApp',
      entry: 'http://localhost:9000',
    },
    {
      name: 'reactApp',
      activeWhen: '/reactApp',
      entry: 'http://localhost:8000',
    },
  ],
});
```

## Functionality

- Multi-technology system coexistence
- Runtime sandboxing
- Independent development and deployment of sub-applications
- Resource preloading
- Rich and diverse plug-in system

## LICENSE

Garfish is released under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).
