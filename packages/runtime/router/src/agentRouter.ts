import { parseQuery, getAppRootPath } from './urlUt';
import { callCapturedEventListeners } from './navEvent';
import { asyncForEach, toMiddleWare, getPath, createEvent } from './utils';
import {
  RouterConfig,
  setRouterConfig,
  RouterInfo,
  __GARFISH_ROUTER_UPDATE_FLAG__,
  __GARFISH_ROUTER_FLAG__,
  __GARFISH_BEFORE_ROUTER_EVENT__,
} from './config';
import CustomEvent from './customEvent';

export const normalAgent = () => {
  // By identifying whether have finished listening, if finished listening, listening to the routing changes do not need to hijack the original event
  // Support nested scene
  const addRouterListener = function () {
    window.addEventListener(__GARFISH_BEFORE_ROUTER_EVENT__, function (env) {
      RouterConfig.routerChange && RouterConfig.routerChange(location.pathname);
      linkTo((env as any).detail);
    });
  };

  if (!window[__GARFISH_ROUTER_FLAG__]) {
    // Listen for pushState and replaceState, call linkTo, processing, listen back
    // Rewrite the history API method, triggering events in the call

    const rewrite = function (type: keyof History) {
      const hapi = history[type];
      return function () {
        const urlBefore = window.location.pathname + window.location.hash;
        const stateBefore = history?.state;
        const res = hapi.apply(this as any, arguments);
        const urlAfter = window.location.pathname + window.location.hash;
        const stateAfter = history?.state;

        const e = createEvent(type);
        (e as any).arguments = arguments;

        if (urlBefore !== urlAfter || stateBefore !== stateAfter) {
          // RouterConfig.routerChange && RouterConfig.routerChange(urlAfter);
          window.dispatchEvent(
            new CustomEvent(__GARFISH_BEFORE_ROUTER_EVENT__, {
              detail: {
                toRouterInfo: {
                  fullPath: urlAfter,
                  query: parseQuery(location.search),
                  path: getPath(RouterConfig.basename!, urlAfter),
                  state: stateBefore,
                },
                fromRouterInfo: {
                  fullPath: urlBefore,
                  query: parseQuery(location.search),
                  path: getPath(RouterConfig.basename!, urlBefore),
                  state: stateAfter,
                },
                eventType: type,
              },
            }),
          );
        }
        // window.dispatchEvent(e);
        return res;
      };
    };

    history.pushState = rewrite('pushState');
    history.replaceState = rewrite('replaceState');

    // Before the collection application sub routing, forward backward routing updates between child application
    window.addEventListener(
      'popstate',
      function () {
        window.dispatchEvent(
          new CustomEvent(__GARFISH_BEFORE_ROUTER_EVENT__, {
            detail: {
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
            },
          }),
        );
      },
      false,
    );

    window[__GARFISH_ROUTER_FLAG__] = true;
  }
  addRouterListener();
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
        state: {},
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
      state: history.state,
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
      (needToActive.length === 0 && autoRefreshApp))
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
      state: history.state,
    },
    fromRouterInfo: {
      fullPath: '/',
      path: '/',
      query: {},
      state: {},
    },
    eventType: 'pushState',
  });
};
