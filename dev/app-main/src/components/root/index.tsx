import React, { Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ConfigProvider } from '@arco-design/web-react';
import { store } from '../../store';
import App from '../../components/App';
import { basename, apps, prefixCls } from '../../constant';
import NotFound from '../../components/notFound';
import HomePage from '../../components/home';
import { hot, setConfig } from 'react-hot-loader';

const LoadApp = React.lazy(() => import('../loadApp'));

setConfig({
  showReactDomPatchNotification: false,
});

const RootComponent = () => {
  return (
    <ConfigProvider prefixCls={prefixCls}>
      <Router>
        <Routes>
          <Route path={`${basename}`} element={<App store={store} />}>
            <Route path="main/home/*" element={<HomePage store={store} />} />
            {/* 使用 loadApp 懒加载组件 */}
            <Route
              path="loadApp/*"
              element={
                <Suspense fallback={<h1>Loading profile...</h1>}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-around',
                      paddingTop: '60px',
                    }}
                  >
                    <LoadApp
                      id="loadApp_vite"
                      domID="submodule-2"
                      appName="dev/vite"
                    />
                    <LoadApp
                      id="loadApp_react16"
                      domID="submodule-3"
                      appName="dev/react16"
                    />
                  </div>
                </Suspense>
              }
            />
          </Route>

          <Route
            path="/"
            element={<Navigate replace to={`${basename}/main/home`} />}
          />

          <Route
            path="examples/"
            element={<Navigate replace to="main/home" />}
          />

          <Route
            path="examples/main"
            element={<Navigate replace to="home" />}
          />

          {/* 路由注册 */}
          {apps.map((v) => {
            return (
              <Route
                key={v.name}
                path={`${basename}${v.activeWhen}/*`}
                element={<App store={store} />}
              ></Route>
            );
          })}

          {/* 由于vue2 的 activeWhen 返回的是函数，需要在这里静态注册路由 */}
          <Route
            path={`${basename}/vue2/*`}
            element={<App store={store} />}
          ></Route>

          <Route
            path={`${basename}/vue2/about`}
            element={<App store={store} />}
          ></Route>

          {/* 子应用通过 loadApp 嵌套子应用 */}
          {/* <Route
              path={`${basename}/vue2/loadApp`}
              element={
                <React.Suspense fallback={<h1>Loading profile...</h1>}>
                  <LoadApp
                    id="loadApp_react16"
                    appName="loadApp_app"
                    domID="submodule-2"
                  />
                </React.Suspense>
              }
            ></Route> */}

          <Route
            path={`${basename}/newRegister/*`}
            element={<App store={store} />}
          ></Route>

          {/* 路由不匹配时渲染 404 页面   */}
          <Route path="*" element={<NotFound />}></Route>
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default hot(module)(RootComponent);
