import { useState, useEffect, useCallback } from 'react';
import { hot, setConfig } from 'react-hot-loader';
import { observer } from 'mobx-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { basename, loadApp } from './constant';
import './App.css';

// 防止控制台后输入hmr 相关 warning
setConfig({
  showReactDomPatchNotification: false,
});

const App = observer(({ store }: { store: any }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoadApp, setIsLoadApp] = useState<boolean>(false);
  const [activeApp, setActiveApp] = useState(store.activeApp);

  useEffect(() => {
    !location.pathname.includes(loadApp) && setIsLoadApp(false);
  }, [location]);

  const getClassName = useCallback(
    (appName) => {
      // 子应用只有一个菜单，子应用内部路由切换使用保持高亮
      if (
        appName.includes(store.activeApp) &&
        location.pathname.includes('angular')
      ) {
        return 'demo-menu-item active';
      }

      // 子应用有多个菜单，子应用内部路由根据 location.pathname 设置当前高亮菜单
      return (appName.includes(store.activeApp) &&
        location.pathname.replace(`/${basename}/`, '') === appName) ||
        location.pathname.replace(`/${basename}/`, '') === `${appName}/`
        ? 'demo-menu-item active'
        : 'demo-menu-item';
    },
    [activeApp, location],
  );

  return (
    <div className="wrapper">
      <div className="header-wrapper">
        <div className="header">
          <a
            onClick={() => {
              navigate(`/${basename}/home`);
              setIsLoadApp(false);
            }}
          >
            Garfish demo
          </a>

          <span
            className="multi-instance"
            onClick={() => {
              if (isLoadApp) {
                navigate(`/${basename}`);
                setIsLoadApp(false);
              } else {
                navigate(`/${basename}/loadApp`);
                setIsLoadApp(true);
              }
            }}
          >
            {isLoadApp ? '关闭' : '开启'}
            react 多实例
          </span>

          <span className="increment" onClick={() => store.increment()}>
            store 通信
          </span>

          <span className="master-store">
            store: {JSON.stringify(store)} total: {store.total}
          </span>
        </div>

        <ul className="demo-menu">
          <li className={getClassName('react17')}>
            {/* 注意： autoRefreshApp 选项关闭后，只能通过 Garfish.router 跳转子应用路由 */}
            <a onClick={() => navigate(`/${basename}/react17`)}>React 17</a>
          </li>
          <li className={getClassName('react17/about')}>
            {/* 注意： autoRefreshApp 选项关闭后，只能通过 Garfish.router 跳转子应用路由 */}
            <a
              onClick={() => {
                navigate(`/${basename}/react17/about`);
                setActiveApp('react17/about');
              }}
            >
              react 17 About
            </a>
          </li>

          <li className={getClassName('react16')}>
            <a onClick={() => navigate(`/${basename}/react16`)}>React 16</a>
          </li>
          <li className={getClassName('react16/about')}>
            <a onClick={() => navigate(`/${basename}/react16/about`)}>
              react 16 About
            </a>
          </li>

          <li className={getClassName('vue3/home')}>
            <a onClick={() => navigate(`/${basename}/vue3/home`)}>vue3</a>
          </li>
          <li className={getClassName('vue3/todo')}>
            <a onClick={() => navigate(`/${basename}/vue3/todo`)}>vue3 todo</a>
          </li>

          <li className={getClassName('vue2/index')}>
            <a onClick={() => navigate(`/${basename}/vue2/index`)}>vue2</a>
          </li>
          <li className={getClassName('vue2/about')}>
            <a onClick={() => navigate(`/${basename}/vue2/about`)}>
              vue2 About
            </a>
          </li>

          <li className={getClassName('vite')}>
            <a onClick={() => navigate(`/${basename}/vite`)}>vite-vue</a>
          </li>

          <li className={getClassName('angular/home')}>
            <a onClick={() => navigate(`/${basename}/angular/home`)}>angular</a>
          </li>
        </ul>
      </div>
      <div className="content">
        <div
          id="submodule"
          style={{
            height: store?.activeApp?.includes('react') ? '100%' : '',
          }}
        ></div>
        <div id="sub-container"></div>
        <Outlet />
      </div>
    </div>
  );
});

export default hot(module)(App);
