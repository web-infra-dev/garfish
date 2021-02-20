# `sandbox`
本 sandbox 能够支持多实例，并且能够支持沙箱嵌套的能力

## debug
`$ yarn dev sandbox -o`

## 设计理念
在浏览器端的沙箱，是提供一套独立的 js 运行时换，包括但是不限于 `js runtime`、`dom`、`bom` 等。实质上，沙箱隔离的是副作用，而且浏览器时时刻刻无处不在的与用户进行交互，也就是说，副作用无处不在。因此，想要完全隔绝，除了 iframe，都是不现实的，这样就有了取舍，也就可以把副作用的处理抽象成一个独立的概念来进行管理

## module
我们把副作用处理抽象成一个个的 `module`，每个 `module` 做着不同的处理，定义统一的接口约定，这样从沙箱本身就限制住了自身的副作用，高内聚，低耦合的做法，可以让沙箱更集中的处理这些事情

## demo
这是一个沙箱初始化 demo
```js
import Sandbox from '@garfish/sandbox';

// 除了 namespace 都是可选的
const sandbox = new Sandbox({
  el: '#app',
  modules: {},
  disabled: {},
  useStrict: true,
  namespace: 'app',
  hooks: {
    onerror(err)  {}
    onstart(sandbox) {},
    onclose(sandbox) {},
    onstart(sandbox) {},
    onClearEffect(sandbox) {},
    onCreateContext(sandbox) {},
    onInvokeAfter(sandbox) {},
    onInvokeBefore(sandbox, refs) {},
  },
})

// 执行一段代码
sandbox.execScript(`${(() => {
  window.a = 1;
  console.log(window.a); // 1
  console.log(unstable_sandbox); // unstable_sandbox 默认会注入进来，你可以拿到当前的沙箱实例
}).toString()}()`)

console.log(window.a); // undefined
```

## 嵌套沙箱 demo
这是一个嵌套两层的沙箱系统，需要注意的是 `unstable_sandbox` 这个变量是当前沙箱的实例，加上 `unstable_` 前缀是因为他现在还不稳定，也不希望业务方使用它，如果业务方使用，gar 将不保证他的兼容性
```js
const to = (window.to = (fn) => `(${fn.toString()})()`);
const sandbox = window.s = new Sandbox({ namespace: 'app' });

window.a = 1
sandbox.execScript(
  to(() => {
    window.a = 2;
    Object.defineProperty(window, 'bb', { value: 1 });
    const nativeWindow = unstable_sandbox.getGlobalObject();

    console.log(window.a, nativeWindow.a); // 2 1
    console.log(window.bb, nativeWindow.bb); // 1 undefined

    unstable_sandbox.reset();
    unstable_sandbox.execScript(
      to(() => {
        window.a = 22;
        Object.defineProperty(window, 'bb', { value: 11 });
        const nativeWindow = unstable_sandbox.getGlobalObject();

        console.log(window.a, nativeWindow.a); // 22 1
        console.log(window.bb, nativeWindow.bb); // 11 undefined
      }),
    )

    console.log(window.a, nativeWindow.a); // 2 1
    console.log(window.bb, nativeWindow.bb); // 1 undefined
  }),
)
console.log(window.a); // 1
```
