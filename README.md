<p align="center">
  <img src="https://lf3-static.bytednsdoc.com/obj/eden-cn/dhozeh7vhpebvog/open-garfish/garfish-icon.png" width="300" alt="garfish" />
</p>

## Garfish

Garfish is a micro front-end framework, mainly used to solve the problems of cross-team collaboration, diversification of technology system, and increasing complexity of applications brought by modern web applications in the context of front-end ecological boom and increasing complexity of web applications, and Garfish has been polished and tested by a large number of online applications, with strong functional stability and reliability.

> Garfish Goals

To compose multiple independently delivered front-end applications into a whole, and to decompose front-end applications into some smaller and simpler applications that can be "independently developed", "independently tested" and "independently deployed", while still appearing to users as cohesive individual products.

## Documentation

[https://bytedance.github.io/garfish/](https://bytedance.github.io/garfish/)

## Quick Start

1. Installation

```bash
$ yarn add garfish #or npm i garfish -S
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
