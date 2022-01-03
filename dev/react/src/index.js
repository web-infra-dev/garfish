import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import 'antd/dist/antd.css';
import './index.css';
import { reactBridge } from '@garfish/bridge';

// const render = ({ dom, basename }) => {
//   ReactDOM.render(
//     <React.StrictMode>
//       <App basename={basename} />
//     </React.StrictMode>,
//     dom.querySelector('#root'),
//   );
// };

export const provider = reactBridge({
  React,
  ReactDOM,
  el: '#root',
  rootComponent: App,
});

// export const provider = () => {
//   return {
//     render: ({ dom, basename }) => render({ dom, basename }),
//     destroy: ({ dom, basename }) =>
//       ReactDOM.unmountComponentAtNode(dom.querySelector('#root')),
//   };
// };

// Which can make application to run independently
if (!window.__GARFISH__) {
  ReactDOM.render(<App basename={'/'} />, document.querySelector('#root'));
}
console.log('fucking !!!!!!!!!');
