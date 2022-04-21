---
title: 沙箱机制
slug: /runtime/sandbox.md
order: 3
---

| 版本 | 日期       | 修订人      | ChangeLog       |
| ---- | ---------- | ----------- | --------------- |
| v0.1 | 2020-12-19 | zengkunpeng | 初始 sandbox    |
| v0.2 | 2022-4-29  | zhouxiao    | 调整 DOM 副作用 |

在微前端的场景，由于多个独立的应用被组织到了一起，在没有类似 `iframe` 的原生隔离下，势必会出现冲突，如全局变量冲突、样式冲突，这些冲突可能会导致应用样式异常，甚至功能不可用。所以想让微前端达到生产可用的程度，让每个子应用之间达到一定程度隔离的沙箱机制是必不可少的。

此外沙箱功能还需要满足多实例的场景，先来了解一下什么是微前端里的多实例。

![image](https://user-images.githubusercontent.com/27547179/164134100-2c4d311e-4849-4ca4-a965-de1ff1a980d0.png)

### 手动执行代码

常规的脚本加载，是通过 `script` 标签去执行的，如

```html
// 内连
<script>
    //code
</sript>

// 外链
<script src="xxx.js"/>
```

要实现沙箱，因为需要控制沙箱的开启和关闭，我们就需要精确掌握脚本的执行时机，所以我们需要寻找一种合适的能手动执行代码的方法

#### eval

`The eval() function evaluates JavaScript code represented as a string.`

首先我们想到的是 eval，由于 eval 有安全、性能等问题，同时也不利于调试，所以在以前我们听到的都是不推荐使用 eval 这个 api。
但是在微前端的沙箱场景，eval 确实是一个比较好的解决方案，比如 `qiankun` 就采用了 `eval` 作为代码执行器。

#### new Function

`The Function constructor creates a new Function object. In JavaScript, every function is actually a Function object.`

`new Function` 通过传入一个 `string` 作为函数的的主体同时返回一个新函数，可以作为 `eval` 的一个替代品

#### 对比

对比 `eval` ，有两点比较重要的不同：

- 不能访问当前环境的变量，但是可以访问全局变量，安全性更高
- 仅需要处理传入的字符串一次，后面重复执行都是同一个函数，而 eval 需要每次都处理，性能更高

```js
var str = '';
for (let i = 0; i < 100; i++) {
  str += `var test_${i} = ${i};\n`;
}
console.time('eval exec');
eval(str);
console.timeEnd('eval exec');
console.time('eval exec 2');
eval(str);
console.timeEnd('eval exec 2');

console.time('fn exec');
var fn = new Function(str);
fn();
console.timeEnd('fn exec');

console.time('fn exec 2');
fn();
console.timeEnd('fn exec 2');
```

运行结果

```javascript
eval exec: 0.251953125 ms
eval exec 2: 0.207763671875 ms
fn exec: 0.1708984375 ms
fn exec 2: 0.001708984375 ms
```

## 实现隔离

上面我们已经找到一种方式比较好的方式去做隔离，假设我们现在通过 `new function` 封装了一个 `execScript` 函数，能够执行传入的字符串。

```javascript
execScript(code:string);
```

那我们下一步就是实现隔离，让这个 `execScript` 的函数和沙箱结合起来。

结合 `Garfish` 的实现来具体看看，目前有两种隔离的方案，一种是快照沙箱，一种是 `vm` 沙箱。

### 快照沙箱

顾名思义，即在某个阶段给当前的运行环境打一个快照，再在需要的时候把快照恢复，从而实现隔离。

类似玩游戏的 `SL` 大法，在某个时刻保存起来，操作完毕再重新 `Load`，回到之前的状态。

#### 实现思路

我们假设有个 `Sandbox` 的类

```js
class Sandbox {
    private snapshotOriginal
    private snapshotMutated
    activate: () => void;
    deactivate: () => void;
}

const sandbox = new Sandbox();
sandbox.activate();
execScript(code)；
sandbox.deactivate();
```

关键的方法就是在 `activate` 和 `deactivate` 两个方法上

1. 在 `activate` 的时候遍历 `window` 上的变量，存为 `snapshotOriginal`
2. 在 `deactivate` 的时候再次遍历 `window` 上的变量，分别和 `snapshotOriginal` 对比，将不同的存到 `snapshotMutated` 里，将 `window` 恢复回到 `snapshotOriginal`
3. 当应用再次切换的时候，就可以把 `snapshotMutated` 的变量恢复回 `window` 上，实现一次沙箱的切换。

### VM 沙箱

`VM` 沙箱使用类似于 `node` 的 `vm` 模块，通过创建一个沙箱，然后传入需要执行的代码。

```javascript
class VMSandbox {
    execScript: (code: string) => void;
    destory: () => void;
}

const sandbox = new VMSandbox();
sandbox.execScript(code)；

const sandbox2 = new VMSandbox();
sandbox2.execScript(code2)；
```

### Proxy

在日常的编程里，会经常用到 `window`、`document` 这类全局对象，所以我们可以去改写 `new function` 里的这些对象，同时收集代码对这些对象的操作，把变更放到一个局部变量，就不会影响全局的 `window`。

结合 `ES6` 的新 `API`：`Proxy`，我们可以比较好的做到这点，我们来实现以下 `execScript`：

```javascript
const varBox = {};
const fakeWindow = new Proxy(window, {
  get(target, key) {
    return varBox[key] || window[key];
  },
  set(target, key, value) {
    varBox[key] = value;
    return true;
  },
});
const fn = new Function('window', code);
fn(fakeWindow);
```

这样我们就可以实现一个简单的沙盒功能。
不过 `Proxy` 有兼容性问题，`Garfish` 最初使用的是 `Proxy` 的 `Polyfill`，虽然不能 100% `Polyfill`，但是 get 和 set 能够满足我们的大多数场景。
然而 `ProxyPolyfill` 的方案实际让我们踩了很多坑，最终决定放弃 `Polyfill` 的方案，采用优先使用 `Proxy` 而不支持 `Proxy` 将降级到快照沙箱。

#### with 语句

虽然上面已经实现了一个简单的沙箱，但是要达到生产环境可用还是远远不够的，在实际的场景里，如下面的一段 `JS`，在浏览器 `script` 标签里执行是没问题的，但是在沙箱里就会报错

```javascript
window.$CONFIG = { a: true }; // 能被成功写到沙箱里

if ($CONFIG.a) {
  // Uncaught ReferenceError: $CONFIG is not defined
  console.log(1);
}
```

因此我们需要用到另一个之前也是被大家建议不要使用的 `api：with`

> The with statement extends the scope chain for a statement.

来改进一下我们的沙箱，使用 with 语句包裹起来

```javascript
const varBox
const fakeWindow = new Proxy(window, {
    get(target, key) {
        if (overides[key]) {
            return ;
        }
        return varBox[key] || window[key];
    },
    set(target, key, value) {
        varBox[key] = value;
        return true;
    }
})
const fn = new Function('window', `
    with(window)
        window.localstorage.setItem('1',123);
    }`
);
fn(fakeWindow);
```

这就可以正常运行了。

#### 异步脚本

在实际环境里，还可能会有异步脚本的加载，如动态 `import`，在 `React` 里是 `Loadable`、`Vue` 里是动态组件，都会让 `webpack` 编译出单独的一个异步脚本，这种脚本是通过 `script` 标签去插入的，从而从沙箱里逃逸。`Garfish` 通过劫持 `document` 的 `createElement` 方法，判断如果是创建 `script` ，则阻止原生行为，通过 `fetch` 去拉取 `script` 的内容，再放到沙箱里执行。
但是这样会带来一个问题，`xhr` 有跨域限制，而 `script` 没有，有一定潜在的风险。

#### 特殊 CASE

- var 导致的逃逸

```javascript
var $CONFIG = { a: true }; // 能被成功写到沙箱里

if ($CONFIG.a) {
  // Uncaught ReferenceError: $CONFIG is not defined
  console.log(1);
}
```

通过 `with + proxy` 可以解决这个问题，因为前面说过 `with` 是通过 `in` 来判断是否在当前作用域内的，而 `Proxy` 的 `has` 能重写 `in `的返回，（而 Proxy 的 Polyfill 无法 Polyfill has 因为无法使用 Proxy 的 ）我们再改写一下沙箱的代码，这段代码就运行成功了。

```javascript
const varBox
const fakeWindow = new Proxy(window, {
    get(target, key) {
        return varBox[key] || window[key] ;
    },
    set(target, key, value) {
        varBox[key] = value;
        return true;
    }，
    has(target, key) {
        return true;
    }
})
const fn = new Function('window', `
    with(window){
        code
        var a = 123;
        a;
    }`
);
fn(fakeWindow);
```

不过这也会带来另一个问题，任何的 `'xxx'` in `window` 都会返回 `true`，明显不符合预期，所以我们做了两个独立的 `proxy`， 一个来作为 `with` 来解决 `var` 的问题，一个就是针对 `window` 做 `proxy`。

```javascript
const varBox = {};
const get = (target, key) => {
  if (key === 'window') {
    return fakeWindow;
  }
  return varBox[key] || window[key];
};

const set = (target, key, value) => {
  varBox[key] = value;
  return true;
};

const has = (target, key) => {
  return true;
};

const context = new Proxy(window, {
  get,
  set,
  has,
});

const fakeWindow = new Proxy(window, {
  get,
  set,
});

const fn = new Function(
  'window',
  'context',
  `
    with(context){
        // code;
        'Vue' in window;
    }`,
);
fn(fakeWindow, context);
```

- this 导致的逃逸

```javascript
this.$CONFIG = { a: true }; // 由于this的特殊性，会被写到window上，严格模式下报错
if ($CONFIG.a) {
  // Uncaught ReferenceError: $CONFIG is not defined
  console.log(1);
}
```

`webpack` 的 `output.globalObject = window` 会自动隐式指向 `window` 的 `this` 构建会指向 `window`，需要注意的是在 `webpack` 低版本中可能不支持该配置。

#### DOM 隔离

`DOM` 隔离分为两种类型：样式节点、`dom` 节点。

- 快照沙箱：处理了样式节点未处理 `DOM` 节点
- VM 沙箱：会处理样式节点和 `DOM` 节点，并且提供了严格模式和非严格模式

样式的隔离在微前端里也是非常重要的一个点，在两个版本的快照里，采用不太一样的处理方式

> 快照沙箱的样式隔离

快照沙箱对样式的隔离主要是遍历 `HTML` 里的 `head` 标签，在 `activate` 的时候，把 `head` 里的 `dom` 记录下来，再 `deactivate` 的时候再恢复。

> VM 沙箱的 DOM 隔离

首先了解一个背景，`webpack` 在构建的时候，最终是通过 `appendChild` 去添加节点到 `html` 里的，所以我们只要通过劫持 `appendChild` 就可以知道有哪些节点被插入，从而实现插入节点的收集，方便进行移除。

在探索新的节点收集方案时，为了能够支持多实例，尝试了比较多的方案。

1. 劫持原型的 appendChild
   最初的版本我们通过重写 HTMLElement.prototype.appendChild，把 append 到 body 的样式放到子应用渲染的根节点里。由于劫持的是原型，这个方案无法支持多实例，如果有多个子应用同时运行，没办法区分是由哪个子应用添加的。

2. 劫持实例的 appendChild
   所以我们想到的是去劫持所有的 dom 节点，通过重写获取 dom 节点的方法，如 `document.querySelector`、`ocument.getElementByID`, 把返回的 `dom` 节点通过 `proxy` 进行包装，这样就能劫持 dom 实例的 appendChild，就可以区分是来自于哪个子应用。但是这个方案经过实践，出现的两个比较棘手的问题：

- 封装后的 dom 节点在传参的时候会报错，如

```javascript
var observer = new MutationObserver(() => {});
observer.observe(proxyDom); // Uncaught TypeError: Failed to execute 'observe' on 'MutationObserver': parameter 1 is not of type 'Node'.
```

- 递归的进行 proxy 带来了性能问题

3. 【目前方案】劫持原型的 `appendChild`，提供 `proxy` 版本的 `document`，在执行 `document.createElement` 方法时会为创建的节点打上来源的标签，表明是哪个应用创建了这个节点， 在通过 `appendChild` 等原型将节点添加文档流时，对节点进行收集，在应用销毁后将收集的节点也进行销毁，由于 `JavaScript` 语法的动态性和灵活性，目前的沙箱方案也存在一些漏洞：

- 节点通过 `parentNode` 一直向上查找至 `document` 节点

```javascript
function getDocuemnt() {
  let dom = document.querySelector('#wrapper');
  while (dom.parentNode) {
    dom = dom.parentNode;
  }
  console.log(dom === document);
}
```

比较多的组件库中都存在这一类逻辑，从而导致逻辑异常。目前的解决逻辑是，一旦子应用内有通过 `document` 进行了查询或创建的行为则将 `html` 的 parentNode 置为 `proxyDocument`

```javascript
function microTaskHtmlProxyDocument(proxyDocument) {
  const html = document.children[0];
  if (html && html.parentNode !== proxyDocument) {
    Object.defineProperty(html, 'parentNode', {
      value: proxyDocument,
      configurable: true,
    });

    if (setting) {
      setting = false;
      nextTick(() => {
        setting = true;
        Object.defineProperty(html, 'parentNode', {
          value: document,
          configurable: true,
        });
      });
    }
  }
}
```

##### 样式隔离

在 `DOM` 隔离章节，我们分别探索了快照沙箱和 `VM` 沙箱的实现，通过 `VM` 沙箱的隔离机制我们能够有效的收集应用创建的 `DOM` 副作用，并能够有效的区分副作用的来源。

目前 `VM` 沙箱的能力上我们能够清除应用在运行期间创建的 `DOM` 和样式节点，避免应用卸载后样式和节点影响其他应用运行，但由于样式会直接对在相同文档流上的节点生效，因此在多实例场景下，样式可能会影响其他应用的正常运行，并且子应用的样式可能会影响主应用或受到主应用样式的影响，因此样式的隔离是不得不考虑解决的副作用之一。

> CSS Module & CSS Namespace

通过修改基础组件样式前缀来实现框架和微应用依赖基础组件样式的隔离性（依赖于工程上 `CSS` 的预处理器编译和运行时基础组件库配置），同时避免全局样式的书写（依赖于约定或工程 `lint` 手段）。如果采用 `namespace` 可能需要在编译阶段做处理

- 优点
  - 不容易产生副作用，可以多实例共存
  - 对于同一个库不同版本的 `CSS`（如 `antd3` 和 `antd4`）, 可以做到彻底隔离
  - 子应用独立运行和在主应用运行表现一致
- 缺点
  - 子应用的节点会受到主应用的影响
  - 一定程度上依赖子应用的开发和构建配置
  - 无法处理 `HTML` 中通过 `link` 插入的样式
  - 未经过编译的动态创建样式也无法处理

> CSS Scope

类似于 `CSS Module` 或 `CSS Namespace`，通过 `scope` 来隔离子应用的所有样式。由于子应用有名称作为唯一标示，且挂载的容器在子应用切换时可以保证唯一性，可以通过统一加 `scope` 的形式处理所有的子应用样式。分为编译时和运行时两种处理方案：编译时提供 `webpack` 插件，对 `css` 编译时自动给子应用的样式添加 `scope`；运行时则是加载子应用时解析，由 `loader` 负责处理。

```css
// 宿主 host app
.next-btn {
  color: #eee;
}
body {
    color: red;
}

// 子应用 sub app
.garfish-module-a-wrapper .next-btn {
  color: #eee;
}

//宿主中生成的节点
<div class="garfish-module-a-wrapper">
  <!-- 子应用的节点 -->
</div>
```

- 优点
  - 不需要用户手动增加配置
- 缺点
  - 子应用的节点会受到主应用的影响
  - 子应用独立运行表现和在主应用运行表现可能不一致
  - 需要配合节点的处理一起进行（组件库可能会创建弹窗到 `body` 下，需要将节点劫持添加到容器内）

多实例下的样式隔离
在多实例场景下，可能会存在多份不同版本的 UI 组件库，从而导致样式冲突，目前的一种解决方案是通过构建工具给所有的样式都加上 namespace，如

```css
#garfish_app1 {
  ...css;
}
```

由于挂载的时候会把所有的节点都挂载在#garfish_app1 上，所以样式仍然能够生效。

```html
<div id="garfish_app1">
  <!-- 子应用的实际dom -->
</div>
```

> Shadow DOM

基于 `Web Components` 的 `Shadow DOM` 能力，将每个子应用包裹到一个 `Shadow DOM` 中，保证其运行时的样式的绝对隔离 `WebComponents Polyfill`

`Shadow dom` 是实现 `Web Components` 的主要技术之一，另外两项分别为 `custom element`、`HTML templates`，在 `Shadow dom` 用简单概括为：将 `Dom` 文档树中的某个节点变为隔离节点，隔离节点内的子节点样式、行为将与外界隔离（隔离节点内的样式不会受到外部影响，也不会影响外部节点，在隔离节点内的事件最终都只会冒泡到隔离节点中）

- Garfish 基于 ShadowDom 实现样式隔离

  - 将容器节点变为 shadow dom
  - 子应用节点操作转发到容器内，动态增加的样式和节点都会放置容器内
  - 查询节点操作转发到容器内
  - 事件向上传播，避免 `React` 依赖事件委托的库失效

- 优点
  - 浏览器基本的样式隔离
  - 支持主子应用样式隔离
  - 支持多实例
- 缺点
  - 需要同时处理 DOM，将 DOM 放置容器内
  - 可能会导致部分组件库或基础库无法正常运行（不支持放置 ShadowDom 内）

### 其他副作用

上面描述的其实只是对于变量的隔离，其实除了变量之外，还会有其他的副作用是需要隔离的，包括但不限于：

- 计时器：`setInterval`、`setTimeout`
- 全局事件监听：`addEventListener`
- 全局存储：`localStorage`、`sessionStorage`

解决方法主要分为两类，能够通过劫持收集的：

1. 如 `setInterval`、`setTimeout`、`addEventListener`，通过重写这些方法，在调用的时候记录起来，放进一个队列里，在沙箱销毁的时候统一进行清除。

2. 持久化数据，无法通过劫持进行收集的，使用命名空间来区分
   如 `localStorage`，`sessionStorage`，重写对象和方法

```javascript
// 代码
localStorage.setItem('a', '1');

// 在SandboxA里执行实际效果
localStorage.setItem('Garfish_A_a', '1');

// 逃逸的场景
Garfish.getRawLocalStorage().setItem('a', '1');
```

### 两种沙箱的对比

![image](https://user-images.githubusercontent.com/27547179/164144636-2d85409e-d011-43c8-929b-07eb287abf2f.png)
![image](https://user-images.githubusercontent.com/27547179/164144650-c2d26150-7779-4bb0-bfbb-3404615335b9.png)
![image](https://user-images.githubusercontent.com/27547179/164144658-3997cb63-20f2-4f8c-a4b4-199389d7f5be.png)
