---
title: 样式问题
slug: /issues/style
order: 5
---

## 样式丢失

可能子应用导出的 `render` 函数有误。

- `render` 的时候直接渲染到子应用根节点了，所以添加进去的样式都被 `render` 覆盖了，导致丢失。
- 样式丢失的很大可能是传递给框架的 `dom` 没有正常的作为挂载节点，由于现在 Garfish 微前端框架具备两种入口方式：`html entry`、`js entry`。

### 作为 `html entry` 时

在作为 `html entry` 时，子应用的挂载点需要基于传入的 `dom` 节点进行选中挂载点。因为在 `html entry` 时，其实类似于 `iframe` 的模式，子应用在独立运行时的所有 `dom` 结构都会被挂到主应用的文档流上。所以子应用在渲染时需要根据子应用的 `dom` 结构去找他的挂载点。

<div class="style-example style-example-bad">
<h4>错误</h4>

```js{6}
export const provider = () => {
  return {
    render({ dom }) {
      ReactDOM.render(React.createElement(HotApp), dom);
    },

    destroy({ dom }) {
      console.log(dom);
    },
  };
};
```

</div>

<div class="style-example style-example-good">
<h4>正确</h4>

```js {6}
export const provider = () => {
  return {
    render({ dom }) {
      ReactDOM.render(React.createElement(HotApp), dom.querySelector('#root'));
    },

    destroy({ dom }) {
      // 此外，destroy 应该正确的执行
      const root = dom && dom.querySelector('#root');
      if (root) {
        ReactDOM.unmountComponentAtNode(root);
      }
    },
  };
};
```

</div>

### 作为 `js entry` 时

```js
export const provider = ({ dom , basename}) => ({
  render(){
  	ReactDOM.render(<App basename={basename} />, dom);
  },

  destroy({ dom }}) {
    ReactDOM.unmountComponentAtNode(dom);
  },
});
```

## 主子应用样式冲突

### ant-design 样式冲突

1. 配置 `webpack` 配置

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.less$/i,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          {
            loader: 'less-loader',
            options: {
              modifyVars: {
                '@ant-prefix': 'define-prefix', // 定制自己的前缀
              },
              javascriptEnabled: true,
            },
          },
        ],
      },
    ],
  },
};
```

2. 配置公共前缀：[antdesign-config](https://ant.design/components/config-provider/#API)

```js
import { ConfigProvider } from 'antd';

export default () => (
  <ConfigProvider prefixCls="define-prefix">
    <App />
  </ConfigProvider>
);
```
