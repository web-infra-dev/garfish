---
title: API 参考
slug: /api/new
order: 2
---

## run

`Garfish.run(options: Options) : Garfish`

### Options

#### `domGetter: () => Element | string`

可填入获取挂载点的节点或者 `querySelect` 可选到的字符。

#### `apps: Array<AppInfo>`

:::note

1. 主框架不会自动与远程 Garfish 管理平台关联，需要手动注入。
2. 子应用资源地址需要支持跨域（**请控制允许的范围，若没有设置允许的范围可能造成安全风险**）。
3. `Garfish` 会根据资源的 `mineType` 判断是 `html entry` 还是 `js entry`。
4. 单个 `js`，导出内容必须为 `provider: { render, destroy }`。
   :::

- `AppInfo: { name, entry, activeWhen, active, deactive }`
  - `name` 模板名称，请确保该名称的唯一性。
  - `entry` 子应用入口
  - `activeWhen` 路径名称，激活子应用的路径，填写根路由, 作为函数使用请勿使用异步逻辑
  - `active` 应用激活时触发触发，用于代替 Garfish 内部默认的渲染逻辑。若应用无法快速接入，可通过该钩子渲染 `iframe`，[详情](https://site.bytedance.net/docs/4545/6924/ifame)
  - `deactive` 应用销毁时触发，用于代替 `Garfish` 内部默认的销毁逻辑，与 `active` 配置同时存在或同时不存在
- 用法：

```ts
Garfish.run({
  apps: [
    {
      name: 'vue-app',
      // 表明在路由跳转到 /vue-app 时会触发 vue-app 应用的渲染
      // 离开 /vue-app 时会触发应用的卸载
      activeWhen: '/vue-app',
      entry: 'http://localhost:3000',
    },
    {
      name: 'react-app',
      // 当 activeWhen 为函数时，当通过 history api 触发路由变化时，会触发该函数用于判断是否需要激活应用，当函数返回 true 时表明激活该应用
      // 该函数可以触发以 /react-app 开头的所有子应用，例如：/react-app2、/react-app 等均会触发应用的渲染
      // 注意：使用函数时，必须使用 activeWhen 的 path 参数作为匹配目标，因为 Garfish 框架内部会自动计算出符合子应用的 basename
      activeWhen: (path) => path.startsWith('/react-app') !== -1,
      entry: 'http://localhost:3000',
    },
  ],
});
```

#### `basename?: string`

- `basename` 默认值为 `'/'`
- 该参数用于作为子应用激活的 `basePath`，并且可以提供给子应用作为子应用的 `basepath`。
- 例如：
  - 子应用：`activeWhen: '/detail'`、`basename: '/toutiao'`。
  - 子应用将会在跳转到：`/toutiao/detail` 激活。
  - 子应用跳转基于：`/toutiao/detail`。
- 如果子应用本身具备路由，需要将 `render` 函数传递的 `basename`，作为路由基础路径。

- 用法：

```js
// 主应用的 index.js
const basePath = 'toutiao';
const router = new VueRouter({
  mode: 'history',
  base: basePath,
});

Garfish.run({
  basename: basePath,
  domGetter: '#submodule',
  apps: [
    {
      name: 'react',
      activeWhen: '/react',
      entry: `http://localhost:3000/index.js`,
    },
  ],
});

const app = new Vue({ router }).$mount('#app');
```

```js
// 子应用的 index.js
// 获取框架传输的主应用提供的 basename，作为子应用的 basename，在路由跳转时将其作为根路由
class App extends React.Component<Props> {
  render() {
    return (
      <BrowserRouter basename={this.props.basename}>
        <div>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
          </ul>
          <Route exact path="/" component={Index}></Route>
        </div>
      </BrowserRouter>
    );
  }
}

export function provider() {
  return {
    render({ dom, basename }) {
      // 渲染到子应用html里的某个节点
      ReactDOM.render(<App basename={basename} />, dom.querySelector('#root'));
    },

    destroy({ dom }) {
      const root = dom && dom.querySelector('#root');
      if (root) {
        ReactDOM.unmountComponentAtNode(root);
      }
    },
  };
}
```

#### `sandbox?: SandboxConfig | false`

- `snapshot?: boolean` 是否开启快照沙箱，默认`false`

#### `props?: Object`

提供参数作为子应用的 `provider` 参数

#### `protectVariable?: Array<string>`

保存指定变量，在沙盒切换过程中不进行清除

#### `autoRefreshApp?: boolean`

默认 `true`，主应用跳转子应用子路由会更新组件

#### `beforeLoad?: (appInfo: AppInfo) => void`

资源加载前调用，返回 `false`，将阻止加载 `app`，此时就可能没有 `app`

#### `beforeMount?: (appInfo: AppInfo, path: string) => void`

子应用挂载前调用

#### `afterMount?: (appInfo: AppInfo, path: string) => void`

子应用挂载后调用

#### `beforeUnmount?: (appInfo: AppInfo, path: string) => void`

子应用销毁前调用

#### `afterUnmount?: (appInfo: AppInfo, path: string) => void`

子应用销毁后调用

#### `customLoader?: (provider: any, path: string, module: App) => void`

自定义加载规则

#### `errorLoadApp?: (err: Error, appInfo: AppInfo) => void`

捕获加载子应用的错误

#### `errorMountApp?: (err: Error, appInfo: AppInfo) => void`

捕获挂载子应用时的错误

#### `errorUnmountApp?: (err: Error, appInfo: AppInfo) => void`

捕获卸载子应用时的错误

#### `onNotMatchRouter?: (path: string) => void`

未匹配到对应子应用时触发

### 示例

```js
import Garfish from '@byted/garfish';

Garfish.run({
  sandbox: false,
  basename: '/exmaple',
  domGetter: '#submodule',
  beforeMount() {
    console.log('应用挂载前');
  },
  afterUnmount() {
    console.log('应用销毁后');
  },
  apps: [
    {
      name: 'index',
      activeWhen: '/index',
      entry: 'sourceUrl', // js entry 或者是 html entry
    },
  ],
});
```

## setExternal

`Garfish.setExternal(nameOrObject: string | Record<string, any>, value?: any) : Garfish`

- `nameOrObject : Externals: { name: string, value: any }`
  - `name` 应用公共模块名
  - `value` 模块实例

### 示例

```js
// 主应用共享组件
import Vue from 'vue';
import Vuex from 'vuex';
import VueRouter from 'vue-router';
import Garfish from '@byted/gar'

Garfish.setExternal({
  'vue': Vue,
  'vuex': Vuex,
  'vue-router': VueRouter,
});


// 子应用，不会将共享的依赖打包进入源码。子应用将会使用主应用共享的模块
// webpack.config.js
module.exports = {
  externals: {
    'vue': 'vue',
    'vuex': 'vuex',
    'vue-router': 'vue-router',
  },
},
```

## registerApp

`Garfish.registerApp(app: AppInfo | AppInfo[]) : Garfish`

用于注册子应用信息，除了在 `Garfish.run` 启动时注册信息外，还允许通过此方法注册子应用信息。

```js
Garfish.registerApp({
  name: 'childApp',
  entry: 'sourceUrl',
  activeWhen: '/xx',
});

// 也可以通过传入一个数组，注册多个 app
Garfish.registerApp([
  {
    name: 'childApp',
    entry: 'sourceUrl',
    activeWhen: '/xx',
  },
]);
```

## getGlobalObject

`Garfish.getGlobalObject() : Window`

用于获取原生的全局对象，无论此时处于主应用还是子应用中。

```js
const nativeWindow = Garfish.getGlobalObject();
```

## setGlobalValue

`Garfish.setGlobalValue(key: string | symbol, value: any) : Garfish`

用于给全局对象设置一个值，这会允许逃逸沙箱。

```js
Garfish.setGlobalValue('a', 1);
console.log(Garfish.getGlobalObject().a); // 1
```

## clearEscapeEffect

`Garfish.clearEscapeEffect(key: string | symbol): Garfish`

我们发现有一些特殊的行为会逃逸沙箱系统，我们可以使用此方法来清除逃逸的变量。

```js
Garfish.clearEscapeEffect('webpackJsonp');
```

## loadApp

`Garfish.loadApp(appName: string, options?: Options) : App | null`

手动加载的 api，详细的用法请看[手动加载 app 文档](/api/attributes/loadApp)
