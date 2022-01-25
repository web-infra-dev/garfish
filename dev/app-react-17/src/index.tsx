import React from 'react';
import ReactDOM from 'react-dom';
import { reactBridge } from '@garfish/bridge';
import RootComponent from './components/root';

const getRootDom = (props: any) =>
  props.dom
    ? props.dom.querySelector('#root')
    : document.querySelector('#root');

// provider 写法：
// export const provider = (props) => {
//   const root = props.dom
//     ? props.dom.querySelector('#root')
//     : document.querySelector('#root');
//   return {
//     render() {
//       ReactDOM.render(<RootComponent {...props} />, root);
//     },
//     destroy({ dom }) {
//       ReactDOM.unmountComponentAtNode(
//         dom ? dom.querySelector('#root') : document.querySelector('#root'),
//       );
//     },
//   };
// };

const render = (props: any) => {
  ReactDOM.render(<RootComponent {...props} />, getRootDom(props));
};

// reactBridge 写法：
export const provider = reactBridge({
  React,
  ReactDOM,
  // el: pass your mount node
  el: '#root',
  // rootComponent: pass a class or stateless function component
  // rootComponent: RootComponent,
  // loadRootComponent: passed a promise that resolves with the react component. Wait for it to resolve before mounting
  loadRootComponent: async (props) => {
    console.log('---loadRootComponent props', props);

    // 监听props 的改变，重新触发 render
    window?.Garfish.channel.on('stateChange', () => {
      render(props);
    });

    return Promise.resolve(() => <RootComponent {...props} />);
  },
  errorBoundary: () => <span>Error</span>,
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
