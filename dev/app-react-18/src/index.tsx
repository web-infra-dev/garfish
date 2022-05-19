import { createRoot } from 'react-dom/client';
import { reactBridge } from '@garfish/bridge-react-v18';
import RootComponent from './root';
import ErrorBoundary from './ErrorBoundary';

export const provider = reactBridge({
  // 在 monorepo 中 link 同仓库 @garfish/bridge-react, 为了防止 react 多实例问题，此处显示传入 ReactDOM，通过 npm 包安装的 @garfish/bridge-react 不需要传入 ReactDom
  el: '#root', //mount node
  rootComponent: RootComponent, // a class or stateless function component
  // a promise that resolves with the react component. Wait for it to resolve before mounting
  loadRootComponent: (props) => {
    return Promise.resolve(() => <RootComponent {...props} />);
  },
  errorBoundary: (e: any) => <ErrorBoundary />,
});

// 在首次加载和执行时会触发该函数
// export const provider = () => {
//   let root = null;
//   return {
//     render({ basename, dom, store, props }) {
//       const container = dom.querySelector('#root');
//       root = createRoot(container!);
//       (root as any).render(<RootComponent basename={basename} />);
//     },
//     destroy({ dom }) {
//       (root as any).unmount();
//     },
//   };
// };

// 这能够让子应用独立运行起来，以保证后续子应用能脱离主应用独立运行，方便调试、开发
if (!window.__GARFISH__) {
  const container = document.getElementById('root');
  const root = createRoot(container!);
  root.render(
    <RootComponent
      basename={
        process.env.NODE_ENV === 'production' ? '/examples/subapp/react18' : '/'
      }
    />,
  );
}
