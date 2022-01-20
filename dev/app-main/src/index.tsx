import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from '@arco-design/web-react';
import { store } from './store';
import App from './components/App';
import { basename, apps, prefixCls } from './constant';
import { GarfishInit } from './garfishInit';
import NotFound from './components/notFound';
import HomePage from './components/home';

// const LoadApp = React.lazy(() => import('./loadApp'));

const render = async () => {
  await GarfishInit();

  ReactDOM.render(
    <ConfigProvider prefixCls={prefixCls}>
      <Router>
        <Routes>
          <Route path={`${basename}`} element={<App store={store} />}>
            <Route path="home" element={<HomePage store={store} />} />
            {/* 使用 loadApp 懒加载组件 */}
            {/* <Route
            path="loadApp/*"
            element={
              <React.Suspense fallback={<h1>Loading profile...</h1>}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-around' }}
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
              </React.Suspense>
            }
          /> */}
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

          {/* 路由不匹配时渲染 404 页面   */}
          <Route path="*" element={<NotFound />}></Route>
        </Routes>
      </Router>
    </ConfigProvider>,
    document.getElementById('root'),
  );
};

render();
