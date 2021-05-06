import { parseQuery, getAppRootPath } from './urlUt';
import { callCapturedEventListeners } from './navEvent';
import { asyncForEach, toMiddleWare, getPath } from './utils';
import {
  RouterConfig,
  setRouterConfig,
  RouterInfo,
  __GARFISH_ROUTER_UPDATE_FLAG__,
} from './config';

export const normalAgent = () => {
  // 侦听pushState及replaceState，调用linkTo、处理、侦听回退
  // 重写history api方法，在调用时触发事件
  const rewrite = function (type: keyof History) {
    const hapi = history[type];
    return function () {
      const urlBefore = window.location.pathname + window.location.hash;
      const res = hapi.apply(this as any, arguments);
      const urlAfter = window.location.pathname + window.location.hash;

      // 兼容ie
      let e;
      if (
        navigator.userAgent.indexOf('MSIE') !== -1 ||
        navigator.appVersion.indexOf('Trident/') > 0
      ) {
        e = document.createEvent('UIEvents');
        e.initUIEvent(type.toLowerCase(), true, false, window, 0);
      } else {
        e = new Event(type.toLowerCase());
      }

      (e as any).arguments = arguments;
      if (urlBefore !== urlAfter) {
        RouterConfig.routerChange && RouterConfig.routerChange(urlAfter);
        linkTo({
          toRouterInfo: {
            fullPath: urlAfter,
            query: parseQuery(location.search),
            path: getPath(RouterConfig.basename!, urlAfter),
          },
          fromRouterInfo: {
            fullPath: urlBefore,
            query: parseQuery(location.search),
            path: getPath(RouterConfig.basename!, urlBefore),
          },
          eventType: type,
        });
      }
      window.dispatchEvent(e);
      return res;
    };
  };

  history.pushState = rewrite('pushState');
  history.replaceState = rewrite('replaceState');

  // 在收集子应用路由前，子应用间前进后退路由更新子应用
  window.addEventListener(
    'popstate',
    function () {
      RouterConfig.routerChange && RouterConfig.routerChange(location.pathname);
      linkTo({
        toRouterInfo: {
          fullPath: location.pathname,
          query: parseQuery(location.search),
          path: getPath(RouterConfig.basename!, location.pathname),
        },
        fromRouterInfo: {
          fullPath: RouterConfig.current!.fullPath,
          path: RouterConfig.current!.path,
          query: RouterConfig.current!.query,
        },
        eventType: 'popstate',
      });
    },
    false,
  );
};

// Overloading to specify the routing
export const linkTo = async ({
  toRouterInfo,
  fromRouterInfo,
  eventType,
}: {
  toRouterInfo: RouterInfo;
  fromRouterInfo: RouterInfo;
  eventType: keyof History | 'popstate';
}) => {
  const {
    basename = '',
    current,
    apps,
    deactive,
    active,
    notMatch,
    beforeEach,
    afterEach,
    autoRefreshApp,
  } = RouterConfig;
  // /、/detail
  const path: string = getPath(basename, location.pathname);

  // Inspection application is activated
  const hasActive = (activeWhen: any) => {
    if (typeof activeWhen === 'string') {
      if (activeWhen[0] !== '/') activeWhen = `/${activeWhen}`;
      const activeWhenArr = activeWhen.split('/');
      const pathArr = path.split('/');
      let flag: boolean = true;
      activeWhenArr.forEach((pathItem: string, index: number) => {
        if (pathItem && pathItem !== pathArr[index]) {
          flag = false;
        }
      });
      return flag;
    } else {
      return activeWhen(path);
    }
  };

  const deactiveApps = current!.matched.filter(
    ({ activeWhen }) => !hasActive(activeWhen),
  );

  // Activate the corresponding application
  const activeApps = apps.filter(({ activeWhen }) => {
    return hasActive(activeWhen);
  });

  const needToActive = activeApps.filter(({ name }) => {
    return !current!.matched.some(({ name: cName }) => name === cName);
  });

  // router infos
  const to = {
    basename: basename,
    ...toRouterInfo,
    matched: needToActive,
  };

  const from = {
    basename: basename,
    ...fromRouterInfo,
    matched: deactiveApps,
  };

  await toMiddleWare(to, from, beforeEach!);

  // Pause the current application of active state
  if (current!.matched.length > 0) {
    await asyncForEach(
      deactiveApps,
      async (appInfo) => await deactive(appInfo, path),
    );
  }

  // save state
  // Root routing is not loaded by default application
  if (path === '/' || !path) {
    setRouterConfig({
      current: {
        path: '/',
        fullPath: basename + '/',
        matched: [],
        query: {},
      },
    });
    await toMiddleWare(to, from, afterEach!);
    return;
  }

  setRouterConfig({
    current: {
      path: getPath(RouterConfig.basename!),
      fullPath: location.pathname,
      matched: activeApps,
      query: parseQuery(location.search),
    },
  });

  // Within the application routing jump, by collecting the routing function for processing.
  // Filtering gar-router popstate hijacking of the router
  // In the switch back and forth in the application is provided through routing push method would trigger application updates
  // application will refresh when autoRefresh configuration to true
  const curState = window.history.state || {};
  if (
    eventType !== 'popstate' &&
    ((needToActive.length === 0 && curState[__GARFISH_ROUTER_UPDATE_FLAG__]) ||
      autoRefreshApp)
  ) {
    callCapturedEventListeners(eventType);
  }

  await asyncForEach(needToActive, async (appInfo) => {
    // Function using matches character and routing using string matching characters
    const appRootPath = getAppRootPath(basename, path, appInfo);
    await active(appInfo, appRootPath);
  });

  if (activeApps.length === 0 && notMatch) notMatch(path);

  await toMiddleWare(to, from, afterEach!);
};

export const listen = () => {
  normalAgent();
  linkTo({
    toRouterInfo: {
      fullPath: location.pathname,
      path: getPath(RouterConfig.basename!),
      query: parseQuery(location.search),
    },
    fromRouterInfo: {
      fullPath: '/',
      path: '/',
      query: {},
    },
    eventType: 'pushState',
  });
};
