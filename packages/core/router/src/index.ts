import { listen } from './agentRouter';
import {
  setRouterConfig,
  RouterConfig,
  set as RouterSet,
  Options,
  AppInfo,
  RouterHook,
  RouterChange,
} from './config';
import { push, replace } from './navEvent';

export { push, replace } from './navEvent';

export const beforeEach = (hook: RouterHook) => {
  RouterSet('beforeEach', hook);
};

export const afterEach = (hook: RouterHook) => {
  RouterSet('afterEach', hook);
};

export const routerChange = (hook: RouterChange) => {
  RouterSet('routerChange', hook);
};

export const registerRouter = (Apps: Array<AppInfo>) => {
  const unregisterApps = Apps.filter(
    (app) => !RouterConfig.apps.some((item) => app.name === item.name),
  );
  RouterSet('apps', RouterConfig.apps.concat(unregisterApps));
};

/**
 * 1.注册子应用
 * 2.对应子应用激活，触发激活回调
 * @param Options
 */
export const listenRouterAndReDirect = ({
  apps,
  basename,
  autoRefreshApp,
  active,
  deactive,
  notMatch,
}: Options) => {
  // 注册子应用、注册激活、销毁钩子
  registerRouter(apps);

  // 初始化信息
  setRouterConfig({
    basename,
    autoRefreshApp,
    // supportProxy: !!window.Proxy,
    active,
    deactive,
    notMatch,
  });

  // 开始监听路由变化触发、子应用更新。重载默认初始子应用
  listen();
};

const Router = {
  push,
  replace,
  beforeEach,
  afterEach,
  registerRouter,
  routerChange,
  listenRouterAndReDirect,
};

//eslint-disable-next-line
export default Router;
