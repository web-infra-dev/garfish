---
title: vue 子应用
slug: /guide/demo/vue
order: 3
---

## vue 子应用接入步骤

### 1. [@garfish/bridge](../../runtime/bridge.md) 依赖安装

:::tip
 1. 请注意，桥接函数 @garfish/bridge 依赖安装不是必须的，你可以自定义导出函数。
 2. 我们提供桥接函数 @garfish/bridge 是为了进一步降低用户接入成本并降低用户出错概率，我们将一些默认行为内置在桥接函数中进行了进一步封装，避免由于接入不规范导致的错误，所以这也是我们推荐的接入方式。
:::

```bash npm2yarn
npm install @garfish/bridge --save
```

### 2. 入口文件处导出 provider 函数

### vue2 导出
<Tabs>
  <TabItem value="bridge_provider_vue2" label="使用 @garfish/bridge 导出" default>

  ```js
  import Vue from 'vue';
  import VueRouter from 'vue-router';
  import store from './store';
  import App from './App.vue';
  import Home from './components/Home.vue';
  import { vueBridge } from '@garfish/bridge';

  Vue.use(VueRouter);
  Vue.config.productionTip = false;

  function newRouter(basename) {
    const router = new VueRouter({
      mode: 'history',
      base: basename,
      routes: [
        { path: '/home', component: Home },
      ],
    });
    return router;
  }

  export const provider = vueBridge({
    Vue,
    // 根组件
    rootComponent: App,
    // 返回一个 promise, 可在 mounting 前执行异步操作
    loadRootComponent: ({ basename, dom, appName, props }) => {
      return Promise.resolve(App);
    },
    // received vueInstance, do something
    handleInstance: (vueInstance, { basename, dom, appName, props }) => {
      console.log(vueInstance, basename, dom, appName, props);
    },
    appOptions: ({ basename, dom, appName, props }) => {
      return {
        el: '#app',
        router: newRouter(basename),
        store,
      };
    },
  });
  ```
</TabItem>

<TabItem value="customer_provider_vue2" label="自定义导出" default>

  ```js
    import Vue from 'vue';
    import App from './App.vue';
    import store from './store';
    import VueRouter from 'vue-router';
    import HelloWorld from './components/HelloWorld.vue';

    Vue.use(VueRouter);
    Vue.config.productionTip = false;

    const render = ({ dom, basename = '/' }) => {
      const router = new VueRouter({
        mode: 'history',
        base: basename,
        router,
        routes: [
          { path: '/', component: HelloWorld },
        ],
      });

      const vm = new Vue({
        store,
        render: (h) => h(App, { props: { basename } }),
      }).$mount();
      (dom || document).querySelector('#app').appendChild(vm.$el);
    };
  ```
  </TabItem>
</Tabs>

### vue3 导出
<Tabs>
  <TabItem value="bridge_provider_vue3" label="使用 @garfish/bridge 导出" default>

  ```js
    import { h, createApp } from 'vue';
    import { createRouter, createWebHistory } from 'vue-router';
    import { stateSymbol, createState } from './store.js';
    import App from './App.vue';
    import Home from './components/Home.vue';
    import { vueBridge } from '@garfish/bridge';

    const routes = [
      { path: '/home', component: Home },
    ];

    function newRouter(basename) {
      const router = createRouter({
        history: createWebHistory(basename),
        base: basename,
        routes,
      });
      return router;
    }

    export const provider = vueBridge({
      createApp,
      rootComponent: App,
      loadRootComponent: ({ basename, dom, appName, props }) => {
        return Promise.resolve(App);
      },

      appOptions: ({ basename, dom, appName, props }) => {
        return {
          el: '#app',
          render: () => h(App),
          router: newRouter(basename),
        };
      },

      handleInstance: (vueInstance, { basename, dom, appName, props }) => {
        vueInstance.use(newRouter(basename));
        vueInstance.provide(stateSymbol, createState());
      },
    });
  ```
  </TabItem>

  <TabItem value="customer_provider_vue3" label="自定义导出" default>

  ```js
    import { h, createApp } from 'vue';
    import { createRouter, createWebHistory } from 'vue-router';
    import { stateSymbol, createState } from './store.js';
    import App from './App.vue';
    import HelloGarfish from './components/HelloGarfish.vue';

    export function provider({ dom, basename }) {
      let app = null;
      return {
        render() {
          app = createApp(App);
          app.provide(stateSymbol, createState());
          const router = createRouter({
            history: createWebHistory(basename),
            base: basename,
            routes: [{ path: '/home', component: HelloGarfish }]
          });
          app.use(router);
          app.mount(
            dom ? dom.querySelector('#app') : document.querySelector('#app'),
          );
        },
        destroy() {
          if (app) {
            app.unmount(
              dom ? dom.querySelector('#app') : document.querySelector('#app'),
            );
          }
        },
      };
    }
  ```
  </TabItem>
</Tabs>

### 3. 根组件设置路由的 basename
:::info
1. 为什么要设置 basename？请参考 [issue](../../issues/childApp.md#子应用拿到-basename-的作用)
2. 我们强烈建议使用从主应用传递过来的 basename 作为子应用的 basename，而非主、子应用约定式，避免 basename 后期变更未同步带来的问题。
3. 目前主应用仅支持 history 模式的子应用路由，[why](../../issues/childApp.md#为什么主应用仅支持-history-模式)
:::

<Tabs>
  <TabItem value="bridge_provider_vue3" label="vue2" default>

  ```js
  import Vue from 'vue';
  import VueRouter from 'vue-router';
  import store from './store';
  import App from './App.vue';
  import Home from './components/Home.vue';
  import { vueBridge } from '@garfish/bridge';

  Vue.use(VueRouter);
  Vue.config.productionTip = false;

  function newRouter(basename) {
    const router = new VueRouter({
      mode: 'history',
      base: basename,
      routes: [
        { path: '/home', component: Home },
      ],
    });
    return router;
  }
  ```
  </TabItem>
  <TabItem value="customer_provider_vue3" label="vue3" default>

  ```js
  import { h, createApp } from 'vue';
  import { createRouter, createWebHistory } from 'vue-router';
  import { stateSymbol, createState } from './store.js';
  import App from './App.vue';
  import Home from './components/Home.vue';
  import { vueBridge } from '@garfish/bridge';

  const routes = [
    { path: '/home', component: Home },
  ];

  function newRouter(basename) {
    const router = createRouter({
      history: createWebHistory(basename),
      base: basename,
      routes,
    });
    return router;
  }
  ```
  </TabItem>
</Tabs>


### 4. 更改 webpack 配置
:::caution 【重要】注意：
1. libraryTarget 需要配置成 umd 规范；
2. globalObject 需要设置为 'window'，以避免由于不规范的代码格式导致的逃逸沙箱；
3. publicPath 设置为子应用资源的绝对地址，避免由于子应用的相对资源导致资源变为了主应用上的相对资源。这是因为主、子应用处于同一个文档流中，相对路径是相对于主应用而言的
4. 'Access-Control-Allow-Origin': '*' 允许开发环境跨域，保证子应用的资源支持跨域。另外也需要保证在上线后子应用的资源在主应用的环境中加载不会存在跨域问题（**也需要限制范围注意安全问题**）；
:::

```js
// vue.config.js
module.exports = {
  configureWebpack: () => {
    return {
      entry: './src/main.js',
      output: {
        filename: '[name].[hash].js',
        chunkFilename: '[name].[hash].js',
        libraryTarget: 'umd',
        globalObject: 'window',
      },
    };
  },
  publicPath: 'http://localhost:8080',
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
}
```
### 5. 增加子应用独立运行兼容逻辑
:::tip
last but not least, 别忘了添加子应用独立运行逻辑，这能够让你的子应用脱离主应用独立运行，便于后续开发和部署。
:::
<Tabs>
  <TabItem value="vue2" label="vue2" default>

  ```js
  // src/main.js
  import Vue from 'vue';
  import VueRouter from 'vue-router';

  // 这能够让子应用独立运行起来，以保证后续子应用能脱离主应用独立运行，方便调试、开发
  if (!window.__GARFISH__) {
      const router = new VueRouter({
        mode: 'history',
        base: '/',
        routes: [
          { path: '/home', component: Home },
        ],
      });
      new Vue({
        store,
        router,
        render: (h) => h(App),
      }).$mount('#app');
  }
  ```
  </TabItem>
  <TabItem value="vue3" label="vue3" default>

  ```js
  // src/main.js
  import { h, createApp } from 'vue';
  import VueRouter from 'vue-router';

  // 这能够让子应用独立运行起来，以保证后续子应用能脱离主应用独立运行，方便调试、开发
  if (!window.__GARFISH__) {
    const router = new VueRouter({
      mode: 'history',
      base: '/',
      routes: [
        { path: '/home', component: Home },
      ],
    });
    const app = createApp(App);
    app.provide(stateSymbol, createState());
    app.use(router);
    app.mount('#app');
  }
  ```
  </TabItem>
</Tabs>
```

