# 快速上手

## 源码调试

```bash
$ npm run dev garfish
# master
$ open http://localhost:2333
# react
$ open http://localhost:3000
# vue
$ open http://localhost:8080
```

### 安装 Garfish

```bash
npm i @garfish/core -S
```

### 在主应用中注册微应用

```js
import Garfish from '@garfish/core';

Garfish.run({
  domGetter: () => document.querySelector('#submoduleContainer'),
  modules: [
    {
      name: 'index',
      entry: 'sourceurl',
      activeWhen: '/index',
    },
    {
      name: 'detail',
      entry: 'sourceurl',
      activeWhen: '/detail',
    },
  ],
});
```

当微应用信息注册完之后，一旦浏览器的 `url` 发生变化，便会自动触发 `Garfish` 的匹配逻辑，path 规则匹配上的微应用就会被插入到指定的 `domGetter` 中，同时依次调用微应用暴露出的生命周期钩子。如果微应用不是直接跟路由关联的时候，你也可以选择手动加载微应用的方式：

```js
Garfish.loadApp('appName').then((app) => {
  app.mount();
});
```

## 微应用

微应用不需要额外安装任何其他依赖即可接入 `Garfish` 主应用。

### 1.导出对应模块信息提供给主应用的内容

```js
// 导出对应的 render 函数和 destroy
// 主应用会在路由跳转到指定子路由后激活子应用并执行 render 方法
// 在离开子应用路由时会调用子应用销毁函数
export function provider() {
  let vm;
  return {
    render({ dom, basename }) {
      vm = new Vue({
        store,
        render: (h) => h(Home),
      }).$mount(dom);
    },

    destroy() {
      vm.$destroy();
      if (vm.$el.parentNode) {
        vm.$el.parentNode.removeChild(vm.$el);
      }
    },
  };
}
```

### 2.配置微应用的打包工具

除了代码中暴露出相应的 render 和 destroy 之外，微应用的打包工具需要增加如下配置来解决：

- 子应用间的代码重复模块
- 目前主应用仅支持解析 commonJS，需要配置导出 commonJS 模块

webpack:

```js
module.exports = {
  output: {
    globalObject: 'window', // 避免 webpack 打包后的代码逃逸除沙箱
    libraryTarget: 'commonjs',
  },
  externals: {
    vue: {
      commonjs: 'vue',
    },
    vuex: {
      commonjs: 'vuex',
    },
    'vue-router': {
      commonjs: 'vue-router',
    },
  },
};
```
