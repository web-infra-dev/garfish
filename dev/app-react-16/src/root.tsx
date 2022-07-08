import React, { createContext } from 'react';
import { ConfigProvider } from '@arco-design/web-react';
import { PropsInfo } from '@garfish/bridge-react';
import {
  BrowserRouter,
  Switch,
  Route,
  MemoryRouter,
  Redirect,
} from 'react-router-dom';
import App from './App';
import PageNotFound from './PageNotFound';
import './App.less';

export const prefixCls = 'sub-app-react16';
export const SubAppContext = createContext<PropsInfo>({} as PropsInfo);

const RootComponent = (appInfo) => {
  const routes = (
    <Switch>
      <Route exact path="/" component={() => <Redirect to="/home" />} />
      <Route exact path="/home" component={() => <App />} />
      <Route exact path="/about" component={() => <App />} />
      <Route exact path="/vm-sandbox" component={() => <App />} />
      <Route exact path="*" component={() => <PageNotFound />} />
    </Switch>
  );
  return (
    <ConfigProvider prefixCls={prefixCls}>
      <SubAppContext.Provider value={{ ...appInfo }}>
        {location.pathname.includes('loadApp') ? (
          <MemoryRouter> {routes} </MemoryRouter>
        ) : (
          <BrowserRouter basename={appInfo.basename}>{routes}</BrowserRouter>
        )}
      </SubAppContext.Provider>
    </ConfigProvider>
  );
};

export default RootComponent;
