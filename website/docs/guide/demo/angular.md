---
title: angular 子应用
slug: /guide/demo/angular
order: 6
---

## angular 子应用接入步骤

### 1. 插件安装

```bash npm2yarn
# 1. 安装 @angular-builders/custom-webpack:browser
npm install @angular-builders/custom-webpack:browser -D

# 2. 安装 @angular-builders/custom-webpack:dev-server
npm install @angular-builders/custom-webpack:dev-server -D
```

### 2. 修改 angular.json
1. 修改 [packageName] > architect > build > builder
```json
// angular.json
"builder": "@angular-builders/custom-webpack:browser",
```
2. 修改 [packageName] > architect > build > options
```json
// angular.json
"options": {
  "customWebpackConfig": {
    // 新增 webpack 配置
    "path": "./custom-webpack.config.js"
  },
  "index": "",
}
```
3. 修改 [packageName] > architect > serve > builder
```json
// angular.json
"builder": "@angular-builders/custom-webpack:dev-server",
```
:::caution
1. 请注意，在 [packageName] > architect > build > options 的配置中，index 属性我们设置为空，这是因为在 angular 13 中编译产物默认会带上 esm 标识，即 type=module, 即使打包产物是 umd 格式，这会导致 garfish 加载子应用失败；
2. index 置空后，编译产物会去除 es module 标识，子应用加载正常；
:::


### 3. 添加 webpack 配置文件
:::caution 【重要】注意：
1. libraryTarget 需要配置成 umd 规范；
2. globalObject 需要设置为 'window'，以避免由于不规范的代码格式导致的逃逸沙箱；
3. 如果你的 webpack 为 v4 版本，需要设置 jsonpFunction 并保证该值唯一（否则可能出现 webpack chunk 互相影响的可能）。若为 webpack5 将会直接使用 package.json name 作为唯一值，请确保应用间的 name 各不相同；
4. publicPath 设置为子应用资源的绝对地址，避免由于子应用的相对资源导致资源变为了主应用上的相对资源。这是因为主、子应用处于同一个文档流中，相对路径是相对于主应用而言的
5. 'Access-Control-Allow-Origin': '*' 允许开发环境跨域，保证子应用的资源支持跨域。另外也需要保证在上线后子应用的资源在主应用的环境中加载不会存在跨域问题（**也需要限制范围注意安全问题**）；
:::

```js
// custom-webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  output: {
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].js',
    libraryTarget: 'umd',
    globalObject: 'window',
    chunkLoadingGlobal: 'Garfish-demo-angular',
    publicPath: 'http://localhost:8080'
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(__dirname, 'src/index.html'),
      chunksSortMode: 'manual',
      chunks: ['styles', 'runtime', 'polyfills', 'scripts', 'vendors', 'main'],
      scriptLoading: 'defer',
    }),
  ],
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
};

```

### 4. 更改 package.json 启动脚本
```json
  "scripts": {
    "builder": "@angular-builders/custom-webpack:dev-server"
  }
```

### 5. 入口文件处导出 provider 函数
```ts
  // src/main.ts
  import { enableProdMode, NgModuleRef } from '@angular/core';
  import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
  import { AppModule } from './app/app.module';
  import { environment } from './environments/environment';

  if (environment.production) {
    enableProdMode();
  }

  let app: void | NgModuleRef<AppModule>;

  async function render() {
    await platformBrowserDynamic()
      .bootstrapModule(AppModule)
      .catch((err) => console.error(err));
  }
  export const provider = ({ dom, basename, props}) => {
    return {
      render,
      destroy({ dom }) {
        const root = dom
          ? dom.querySelector('#root')
          : document.querySelector('#root');
      },
    };
  };
```

### 6. 根组件设置路由的 basename
:::info
1. 为什么要设置 basename？请参考 [issue](../../issues/childApp.md#子应用拿到-basename-的作用)
2. 我们强烈建议使用从主应用传递过来的 basename 作为子应用的 basename，而非主、子应用约定式，避免 basename 后期变更未同步带来的问题。
3. 目前主应用仅支持 history 模式的子应用路由，[why](../../issues/childApp.md#为什么主应用仅支持-history-模式)
:::
```ts
// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { TopBarComponent } from './topBar/topBar.component';
import { HomeComponent } from './home/home.component';
import { APP_BASE_HREF } from '@angular/common';

@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    RouterModule.forRoot([
      { path: '/home', component: HomeComponent }
    ])
  ],
  providers: [{ provide: APP_BASE_HREF, useValue: '/examples/angular' }],
  declarations: [
    AppComponent,
    TopBarComponent,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

### 7. 增加子应用独立运行兼容逻辑
:::tip
last but not least, 别忘了添加子应用独立运行逻辑，这能够让你的子应用脱离主应用独立运行，便于后续开发和部署。
:::
```js
// src/main.ts
import { enableProdMode, NgModuleRef } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

async function render() {
  await platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err));
}

if (!(window as any).__GARFISH__) {
  render();
}
```
