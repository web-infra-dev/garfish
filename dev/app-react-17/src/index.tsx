import ReactDOM from 'react-dom';
import { reactBridge } from '@garfish/bridge-react';
import RootComponent from './components/root';
import ErrorBoundary from './components/ErrorBoundary';

let _root;
let _props;
const getRootDom = (dom: any) =>
  dom ? dom.querySelector('#root') : document.querySelector('#root');

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

export const provider = reactBridge({
  // 在 monorepo 中 link 同仓库 @garfish/bridge-react, 为了防止 react 多实例问题，此处显示传入 ReactDOM，通过 npm 包安装的 @garfish/bridge-react 不需要传入 ReactDom
  ReactDOM,
  el: '#root', //mount node
  rootComponent: RootComponent, // a class or stateless function component
  // a promise that resolves with the react component. Wait for it to resolve before mounting
  loadRootComponent: (appInfo) => {
    _root = getRootDom(appInfo.dom);
    _props = appInfo;
    return Promise.resolve(() => <RootComponent {...appInfo} />);
  },
  errorBoundary: (e: any) => <ErrorBoundary />,
});

// 这能够让子应用独立运行起来，以保证后续子应用能脱离主应用独立运行，方便调试、开发
if (!window.__GARFISH__) {
  ReactDOM.render(
    <RootComponent
      basename={
        process.env.NODE_ENV === 'production' ? '/examples/subapp/react17' : '/'
      }
    />,
    document.querySelector('#root'),
  );
}
