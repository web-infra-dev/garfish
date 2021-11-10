import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import 'antd/dist/antd.css';
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <App basename={'/'} />
  </React.StrictMode>,
  document.querySelector('#root'),
);
