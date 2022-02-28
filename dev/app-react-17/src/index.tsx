import ReactDOM from 'react-dom';
import React from 'react';
import { reactBridge } from '@garfish/bridge';
import RootComponent from './components/root';
import Error from './components/ErrorBoundary';

let _root;
let _props;
const getRootDom = (props: any) =>
  props.dom
    ? props.dom.querySelector('#root')
    : document.querySelector('#root');

export const render = () =>
  ReactDOM.render(<RootComponent {..._props} />, _root);

// provider 写法：
// export const provider = (props) => {
//   const root = getRootDom(props);
//   _root = root;
//   _props = props;

//   return {
//     render() {
//       window?.Garfish.channel.on('stateChange', render);
//       ReactDOM.render(<RootComponent {...props} />, root);
//     },
//     destroy({ dom }) {
//       console.log('-------destroy');
//       window?.Garfish.channel.removeListener('stateChange', render);
//       ReactDOM.unmountComponentAtNode(
//         dom ? dom.querySelector('#root') : document.querySelector('#root'),
//       );
//     },
//   };
// };

// TODO: reactBridge 写法(待补充 reactBridge destory 前的hook 函数)
export const provider = reactBridge({
  React,
  ReactDOM,
  el: '#root', //mount node
  rootComponent: RootComponent, // a class or stateless function component
  // loadRootComponent: a promise that resolves with the react component. Wait for it to resolve before mounting
  loadRootComponent: (props) => {
    const root = getRootDom(props);
    _root = root;
    _props = props;
    return Promise.resolve(() => <RootComponent {...props} />);
    // return Promise.resolve(RootComponent);
  },
  errorBoundary: () => <Error />,
});

// 这能够让子应用独立运行起来，以保证后续子应用能脱离主应用独立运行，方便调试、开发
if (!window.__GARFISH__) {
  ReactDOM.render(
    <RootComponent
      store={undefined}
      basename={
        process.env.NODE_ENV === 'production' ? '/examples/subapp/react17' : '/'
      }
    />,
    document.querySelector('#root'),
  );
}
