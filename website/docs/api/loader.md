---
title: Garfish.loader
slug: /api/loader
order: 4
---
import Highlight from '@site/src/components/Highlight';


`Garfish.loadApp` 底层使用 `Garfish.loader` 来进行资源加载，因此可以通过 `Garfish.loader` 来添加资源加载过程中的回调以及资源的缓存策略

## `Garfish.loader`
`Garfish.loader` 是 `Garfish` 实例上的属性，由 `Garfish` 加载器提供。该属性上提供加载资源、缓存、解析能力，可以通过 `Garfish.loader` 上的属性可控制资源的加载策略和缓存策略。

### Type
```ts
interface Garfish {
  loader: LoaderInterface;
}

interface LoaderLifecycle{
  fetch: (string, RequestInit)=> Promise<Response> | void | undefined
}

interface LoaderInterface {
  setLifeCycle: (lifeCycle: Partial<LoaderLifecycle>)=> void;
}
```

### Garfish.loader.setLifeCycle

可设置 `Garfish.loader` 在资源加载过程中的处理逻辑

#### Type
```ts
(lifeCycle: Partial<LoaderLifecycle>)=> void;
```

#### 参数

`options`

##### fetch?

- Type: <Highlight>LoaderLifecycle['fetch']</Highlight>
- 入参: [<Highlight>Parameters&lt;LoaderLifecycle['fetch']&gt;</Highlight>](https://developer.mozilla.org/en-US/docs/Web/API/fetch#parameters)
- 返回值: [<Highlight>ReturnType&lt;LoaderLifecycle['fetch']&gt;</Highlight>](https://developer.mozilla.org/en-US/docs/Web/API/fetch#return_value)
- 示例

```ts
import Garfish from 'garfish';

Garfish.register({
  name: 'react',
  entry: 'http://localhost:3000/index.js'
})

// 设置 loader 的 fetch hook 返回值
// 在 Garfish 调用 http://localhost:3000/index.js 地址时，返回指定的 Response 内容
// 其他情况不处理，交由原生 fetch 发起请求
Garfish.loader.setLifeCycle({
  fetch(url){
    if (url === 'http://localhost:3000/index.js') {
      return Promise.resolve(new Response(`
        console.log('hello world');
      `, {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      }))
    },
  },
})

```

#### 说明

1. `fetch` 可以在失败重试、资源自定义缓存读取等场景中使用
2. 使用自定义 `fetch` 可以针对特定的资源进行自定义内容返回，当返回的内容为 `Promise<Response>` 实例时， Garfish 内部将不再发起 `fetch`，若返回的内容为其他类型的值将继续通过原生 `fetch` 请求资源
3. 返回的 `Response` 实例，需要携带 `status` 和 `content-type` 若未正确携带资源类型，`Garfish` 可能无法正确识别出资源的类型

