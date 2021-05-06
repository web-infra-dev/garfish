import React from 'react';
import ReactDOM from 'react-dom';
import Garfish from '@garfish/core';

import App from './App';
import * as ReactDom from 'react-dom';
import * as mobxReact from 'mobx-react';
import * as reactRouterDom from 'react-router-dom';
import { store } from './store';

const { Provider } = mobxReact;
let basePath = 'react-demo';
let apps = [
  {
    name: 'vue3-html',
    activeWhen: '/vue3-html',
    entry: `http://0.0.0.0:8093`,
  },
  {
    name: 'vue2',
    activeWhen: '/vue2',
    entry: `http://0.0.0.0:8092/index.js`,
  },
  {
    name: 'react16',
    activeWhen: '/react16',
    entry: `http://0.0.0.0:8094/index.js`,
  },
  {
    name: 'react17-html',
    activeWhen: '/react17-html',
    entry: `http://0.0.0.0:8095`,
  },
  {
    name: 'umi-html',
    activeWhen: '/umi',
    entry: `http://0.0.0.0:8000`,
  },
];

const init = () => {
  Garfish.setExternal({
    react: React,
    'react-dom': ReactDom,
    'react-router-dom': reactRouterDom,
    'mobx-react': mobxReact,
  });

  Garfish.channel.on('sandbox-variable', (modifyVal) => {
    console.log('side effects when sub app is running: ', modifyVal);
  });

  Garfish.run({
    appID: 'garfish_react_demo',
    domGetter: '#submodule',
    protectVariable: ['__REACT_ERROR_OVERLAY_GLOBAL_HOOK__'],
    basename: basePath,
    apps,
    props: {
      store,
    },
  });
  render();
};

const render = () => {
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root'),
  );
};

init();
