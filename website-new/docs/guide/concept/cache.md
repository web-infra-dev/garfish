# 缓存机制

`Garfish` 的设计的初衷并不是为了取代 `iframe`，而是为了将一个单体应用拆分成多个子应用后也能保证应用一体化的使用体验，`Garfish` 为了提升应用的渲染性能，提供了缓存渲染模式。

缓存的形式分为两种，一种是缓存 `App` 的实例，缓存 `App` 的实例比较容易理解，`Garfish` 在通过 `loadApp` 加载子应用后可以保留 `App` 的实例，另外一种则是缓存子应用的执行上下文，第二遍执行时不执行所有代码来提升整体的渲染速度。

## 提升渲染速度

为什么 `Garfish` 的子应用需要提供 `provider` 函数呢？原因是通过提供 `provider` 生命周期，我们可以尽可能的优化渲染速度。

- 在应用销毁时触发对应框架应用的销毁函数，以达到对框架类型的销毁操作，应用中的一些销毁 `hook` 也可以正常触发
- 在第二次应用加载时可以启动缓存模式
  - 在应用第一次渲染时的路径为，`html` 下载=> `html` 拆分=> 渲染 `dom` => 渲染 `style` => 执行 `JS` => 执行 `provider` 中的函数
  - 在第二次渲染时可以将整个渲染流程简化为，还原子应用的 `html` 内容=> 执行 `provider` 中的渲染函数。因为子应用的真实执行环境并未被销毁，而是通过 `render` 和 `destroy` 控制对应应用的渲染和销毁
- 避免内存泄漏
  - 由于目前 `Garfish` 框架的沙箱依赖于浏览器的 `API`，无法做到物理级别的隔离。由于 `JavaScript` 语法的灵活性和闭包的特性，第二次重复执行子应用代码可能会导致逃逸内容重复执行
  - 采用缓存模式时，将不会执行所有代码，仅执行 `render` ，将会避免逃逸代码造成的内存问题

> 缓存模式下的弊端

- 启动缓存模式后也存在一定弊端，第二遍执行时 `render` 中的逻辑获取的还是上一次的执行环境并不是一个全新的执行环境，下面代码中在缓存模式时和非缓存模式不同的表现
  - 在缓存模式中，多次渲染子应用会导致 `list` 数组的值持续增长，并导致影响业务逻辑
  - 在非缓存模式中，多次渲染子应用 `list` 数组的长度始终为 `1`
- `Garfish` 框架无法有效区分哪些副作用需要销毁
  - 在缓存模式中并不会执行子应用的所有代码，只会还原子应用的上下文并执行子应用的 `render` 函数，因此无法区分哪些副作用是实际应用 `render` 过程中创建的还是其他基础库造成的
  - 目前 `Garfish` 框架在缓存模式下仅会收集和清除：样式副作用、环境变量

```js
const list = [];

export const provider = () => {
  return {
    render: ({ dom, basename }) => {
      list.push(1);
      ReactDOM.render(
        <React.StrictMode>
          <App basename={basename} />
        </React.StrictMode>,
        dom.querySelector('#root'),
      );
    },

    destroy: ({ dom, basename }) => {
      ReactDOM.unmountComponentAtNode(dom.querySelector('#root'));
    },
  };
};
```

具体使用如何使用缓存模式请参考：[Garfish.loadApp](/api/loadApp)

## 缓存 App 实例

手动加载提供了 `cache` 功能，以便复用 `app`，避免重复的编译代码造成的性能浪费，在 `Garfish.loadApp` 时，传入 `cache` 参数就可以。

 例如下面的代码：

```js
const app1 = await Garfish.loadApp('appName', {
  cache: true,
});

const app2 = await Garfish.loadApp('appName', {
  cache: true,
});

console.log(app1 === app2); // true
```

实际上，对于加载的 `promise` 也会是同一份，例如下面的 demo

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
