import { ConfigProvider } from '@arco-design/web-react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import PageNotFound from './PageNotFound';
import './App.less';
import { AppInfo } from '@garfish/bridge-react-v18';

export const prefixCls = 'sub-app-react16';

const Index = <div style={{ marginBottom: '30px' }}>This is Home Page.</div>;
const About = <div style={{ marginBottom: '30px' }}>This is About Page. </div>;

const RootComponent = (appInfo: AppInfo) => {
  const routes = (
    <Routes>
      <Route path="/" element={<App />}>
        <Route path="/home" element={Index} />
        <Route path="/about" element={About} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
  return (
    <ConfigProvider prefixCls={prefixCls}>
      <BrowserRouter basename={appInfo.basename}>{routes}</BrowserRouter>
    </ConfigProvider>
  );
};

export default RootComponent;
