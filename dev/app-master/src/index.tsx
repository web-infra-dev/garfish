import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { store } from './store';
import App from './App';
import { basename, apps } from './constant';
import { GarfishInit } from './garfishInit';
import NotFound from './NotFound';
import HomePage from './HomePage';

const LoadApp = React.lazy(() => import('./loadApp'));

const render = async () => {
  await GarfishInit();

  ReactDOM.render(
    <Router>
      <Routes>
        <Route path={`${basename}`} element={<App store={store} />}>
          <Route path="home" element={<HomePage />} />
          {/* 使用 loadApp 懒加载组件 */}
          <Route
            path="loadApp/*"
            element={
              <React.Suspense fallback={<h1>Loading profile...</h1>}>
                <LoadApp appName="loadApp_app" domID="submodule-2" />
              </React.Suspense>
            }
          />
        </Route>

        <Route path="/" element={<App store={store} />}></Route>

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
        <Route
          path={`${basename}/vue2/loadApp`}
          element={
            <React.Suspense fallback={<h1>Loading profile...</h1>}>
              <LoadApp appName="loadApp_app" domID="submodule-2" />
            </React.Suspense>
          }
        ></Route>

        {/* 路由不匹配时渲染 404 页面   */}
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </Router>,
    document.getElementById('root'),
  );
};

render();
