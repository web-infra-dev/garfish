---
title: 错误处理和 sourcemap
slug: /blog/sourcemap
order: 3
---

## 背景

微前端场景下，存在沙盒机制，基于 eval 和 new Function 的形式去实现沙箱机制。在手动执行代码的情况下，会产生堆栈丢失、sourcemap 还原错行等问题。

## 解决方案

1. 修改代码执行方式，开发环境可用

> 解决堆栈错行

- step1：升级主应用至 garfish 至最新版本

2. 新增 webpack 插件，解决生产环境问题堆栈还原问题

> 子应用与 Garfish 相关微前端配置可以自动生成，解决代码压缩后在 Garfish 沙箱内执行堆栈异常

```js
// webpack配置
const webpack = require('webpack');

config.plugins = [
  new webpack.BannerPlugin({
      banner: 'Micro front-end',
  });
]
```

## 具体问题

## 堆栈丢失问题

使用 eval、new Function 去执行函数，如果在错误抛出的时候，堆栈是不完整的，只会显示到 eval 或 new Function 执行的那行。
如

```js
var str = `
    var a = 1;
    throw Error(123)
`;
eval(str);
```

错误抛出的位置是 eval 的这行，（new Function 同理）。
![image.png](https://tosv.byted.org/obj/eden-internal/ozpmyhn_lm_hymuPild/ljhwZthlaukjlkulzlp/sourcemap1.png)

这也是此前许多使用 Garfish 的用户遇到的一个问题，js 执行出错，但是缺少堆栈，导致排查困难。

## 解决方法

对于此问题，浏览器是提供了相关解决方案来解决的，那就是 sourceURL。
（MDN：https://developer.mozilla.org/en-US/docs/Tools/Debugger/How_to/Debug_eval_sources）

我们还是拿上面的例子，增加了 sourceURL

```js
var str = `
    var a = 1;
    throw Error(123)
//# sourceURL=./index.js
`;
eval(str);
```

可以看到有了具体的堆栈。

于是 Garfish 执行代码的形式变成，这样抛出的错误就有详细的堆栈，能够解决看不到堆栈的问题。

```js
new Function('
    ...code
//# sourceURL=url
'
```

## sourcemap 对应错误

### 错行

由于使用 new Function 来执行，加上拼接了一些变量，所以使用构建生成的 sourcemap 来还原会导致错行的问题。
源码

```js
// code

// 沙箱里执行的代码
function (window) {
    with(window) {
        // code
    }
}
```

可以看到使用 sourcemap 还原的时候会错两行，这也是很多使用 Garfish 的同学遇到的问题，sourcemap 定位错误，虽然能够还原一定的情况，但是对于 debug 来说，还是比较蛋疼的。

#### 解决方法

使用 eval 替代 new Function，同时将拼接的代码放置于同一行。

形如

```js
eval(function(window) {{with} { //code
}}
```

这样可以解决错行的问题。

### 错列

上面的解决方法可以解决行数对应不上的问题，在开发环境基本没有问题，因为代码没有进行压缩。
由于在前面增加了"function(window)"，列数对应还是有问题的，特别是对于生产环境还是有比较大的问题，因为生产环境代码会压缩成一行，所以列数对应不上就成了大问题。

### 方案对比

1. 在运行时进行错误抛出的时候修正列数
   我们可以计算出错的列数的数字，catch 住错误然后对 error 的 stack 进行修改。
   问题：无法捕获所有的错误，有的错误不是在编译阶段抛出，可能在页面渲染或者交互的时候抛出的，这些错误 garfish 无法捕获，也尝试重写 Error 对象，但是无法涵盖全部情况。

- 捕获所有异常
  - window.onerror
  - 常见异步 api 封装：
    - setTimeout、promise 捕获异常
  - Dom
    - 事件流都包了一层

2. 在编译的时候修正列数
3. 在编译阶段修正，如生成的 sourcemap 就进行列的偏移，但是这会导致独立运行的时候子应用堆栈不正确。
   所以经过考虑，可能在生产编译产物和 sourcemap 的时候，就默认给 js 文件顶部生产一行注释，不仅可以解决行数列数对应不上问题，也可以解决独立运行子应用的问题。对于不经过编译的 cdn 加载文件有问题。
