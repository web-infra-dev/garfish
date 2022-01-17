import { createContext } from 'react';
import App from './App';
import './App.css';
import { BrowserRouter } from 'react-router-dom';

export const SubAppContext = createContext({});

const RootComponent = (props) => {
  /***
   * 兼容 loadRootComponent 和 rootComponent 两种写法
   * rootComponent 传递的 props 会包裹一层 appInfo 和 userProps，loadRootComponent 则将参数直接传递
   * rootComponent 优先级高于loadRootComponent， 二者同时存在时，只有 rootComponent 会生效
   */
  const basename = props.basename || props.appInfo?.basename;
  const store = props.store || props.userProps?.store;

  return (
    <SubAppContext.Provider value={{ basename, store }}>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </SubAppContext.Provider>
  );
};

export default RootComponent;
