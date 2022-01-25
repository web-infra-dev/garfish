import { createContext } from 'react';
import { ConfigProvider } from '@arco-design/web-react';
import App from '../App';
import Home from '../home';
import Detail from '../detail';
import List from '../list';
import { BrowserRouter } from 'react-router-dom';
import { prefixCls } from '../../constant';
import { Routes, Route, Navigate } from 'react-router-dom';
export const SubAppContext = createContext({});
const PageNotFound = () => <div>Page not found! </div>;
import { hot, setConfig } from 'react-hot-loader';

// 防止控制台后输入hmr 相关 warning
setConfig({
  showReactDomPatchNotification: false,
});

const RootComponent = (_props) => {
  const { basename, store } = _props;
  return (
    <ConfigProvider prefixCls={prefixCls}>
      <SubAppContext.Provider value={{ basename, store }}>
        <BrowserRouter basename={basename}>
          <Routes>
            <Route path="/" element={<App />}>
              <Route path="/home" element={<Home />}></Route>
              <Route path="/list" element={<List />}></Route>
              <Route path="/detail" element={<Detail />}></Route>
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </BrowserRouter>
      </SubAppContext.Provider>
    </ConfigProvider>
  );
};

export default hot(module)(RootComponent);
