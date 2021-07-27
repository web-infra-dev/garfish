---
title: style question
slug: /issues/style
order: 5
---

## Missing styles

Maybe the `render` function exported by the child application is wrong.

- The `render` is rendered directly to the root of the child application, so the styles added are overwritten by the `render` and lost.
- It is very likely that the style is lost because the `dom` passed to the framework is not properly used as a mount node, since the Garfish micro front-end framework now has two entry methods: `html entry`, `js entry`.

### When used as `html entry`

As `html entry`, the child application mount point needs to be selected based on the incoming `dom` node. Because in `html entry`, it is actually similar to the `iframe` model, where all `dom` structures of the child application are mounted to the document stream of the main application when it runs independently. So the child app needs to find its mount point based on the child app's `dom` structure when rendering.

<div class="style-example style-example-bad">
<h4>Errors</h4>

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
<h4>correct</h4>

```js {6}
export const provider = () => {
  return {
    render({ dom }) {
      ReactDOM.render(React.createElement(HotApp), dom.querySelector('#root'));
    },

    destroy({ dom }) {
      // Also, destroy should be executed correctly
      const root = dom && dom.querySelector('#root');
      if (root) {
        ReactDOM.unmountComponentAtNode(root);
      }
    },
  };
};
```

</div>

### When used as a `js entry`

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

## Main child application style conflict

### arco-design multi-version style conflicts

1. [Arco-design Global Configuration ConfigProvider](https://arco.design/react/components/config-provider)
2. set different `prefixCls` prefixes for child applications

### ant-design style conflicts

1. Configure `webpack` configuration

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
                '@ant-prefix': 'define-prefix', // customize your own prefix
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

2. Configure the public prefix: [antdesign-config](https://ant.design/components/config-provider/#API)

```js
import { ConfigProvider } from 'antd';

export default () => (
  <ConfigProvider prefixCls="define-prefix">
    <App />
  </ConfigProvider
);
```
