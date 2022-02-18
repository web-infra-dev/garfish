import React, { createContext, Suspense } from 'react';
import { ConfigProvider } from '@arco-design/web-react';
import App from '../app';
import Home from '../home';
import Detail from '../detail';
import List from '../list';
import PageNotFound from '../pageNotFound';
import { BrowserRouter } from 'react-router-dom';
import { prefixCls } from '../../constant';
import { Routes, Route, Navigate } from 'react-router-dom';
export const SubAppContext = createContext({});
const LazyComponent = React.lazy(() => import('../lazyComponent'));

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
              <Route
                path="/lazy-component"
                element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <LazyComponent />
                  </Suspense>
                }
              ></Route>
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </BrowserRouter>
      </SubAppContext.Provider>
    </ConfigProvider>
  );
};

export default RootComponent;
