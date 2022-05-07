import { createRoot } from 'react-dom/client';
import RootComponent from './root';

// 在首次加载和执行时会触发该函数
export const provider = () => {
  let root = null;
  return {
    render({ basename, dom, store, props }) {
      const container = dom.querySelector('#root');
      root = createRoot(container!);
      (root as any).render(<RootComponent basename={basename} />);
    },
    destroy({ dom }) {
      (root as any).unmount();
    },
  };
};

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
