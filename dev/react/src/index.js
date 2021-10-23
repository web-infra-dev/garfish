import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import 'antd/dist/antd.css';
import './index.css';

const render = ({ dom, basename }) => {
  ReactDOM.render(
    <React.StrictMode>
      <App basename={basename} />
    </React.StrictMode>,
    dom.querySelector('#root'),
  );
};

export const provider = ({ dom, basename, appName }) => {
  // console.log('registerApp props', basename);
  return {
    render: () => render({ dom, basename }),
    destroy: () => ReactDOM.unmountComponentAtNode(dom.querySelector('#root')),
  };
};

// Which can make application to run independently
if (!window.__GARFISH__) {
  render({
    dom: document.body,
  });
}
