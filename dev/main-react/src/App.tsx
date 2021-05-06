/* eslint-disable */
import React from 'react';
import { hot } from 'react-hot-loader';
import { observer, inject } from 'mobx-react';

const App = ({ store }: any) => {
  return (
    <div>
      <div className="header">
        <span>Garfish demo</span>
        {/* <a onClick={() => { store.increment() }}>increment</a> */}
        <span className="master-store">
          store: {JSON.stringify(store)} total: {store.total}
        </span>
      </div>
      <div className="menu">
        <ul className="demo-menu">
          <li className="demo-menu-item">
            <a
              onClick={() =>
                window.Garfish.router.push({ path: '/vue3-html/' })
              }
            >
              Vue 3
            </a>
          </li>
          <li className="demo-menu-item">
            <a
              onClick={() =>
                window.Garfish.router.push({ path: '/vue3-html/index' })
              }
            >
              Vue 3 Index
            </a>
          </li>
          <li className="demo-menu-item">
            <a onClick={() => window.Garfish.router.push({ path: '/vue2/#/' })}>
              Vue 2
            </a>
          </li>
          <li className="demo-menu-item">
            <a
              onClick={() =>
                window.Garfish.router.push({ path: '/vue2/#/about' })
              }
            >
              Vue 2 About
            </a>
          </li>
          <li className="demo-menu-item">
            <a onClick={() => window.Garfish.router.push({ path: '/react16' })}>
              React 16
            </a>
          </li>
          <li className="demo-menu-item">
            <a
              onClick={() =>
                window.Garfish.router.push({ path: '/react16/about' })
              }
            >
              React 16 About
            </a>
          </li>
          <li className="demo-menu-item">
            <a
              onClick={() =>
                window.Garfish.router.push({ path: '/react17-html' })
              }
            >
              React 17
            </a>
          </li>
          <li className="demo-menu-item">
            <a
              onClick={() =>
                window.Garfish.router.push({ path: '/react17-html/about' })
              }
            >
              react 17 About
            </a>
          </li>
          <li className="demo-menu-item">
            <a onClick={() => window.Garfish.router.push({ path: '/umi' })}>
              umi
            </a>
          </li>
        </ul>
      </div>
      <div id="submodule"></div>
    </div>
  );
};

export default hot(module)(inject('store')(observer(App)));
