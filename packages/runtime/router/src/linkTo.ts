import { parseQuery, getAppRootPath } from './utils/urlUt';
import { callCapturedEventListeners } from './utils/navEvent';
import { asyncForEach, toMiddleWare, getPath } from './utils';
import {
  RouterConfig,
  setRouterConfig,
  RouterInfo,
  __GARFISH_ROUTER_UPDATE_FLAG__,
  __GARFISH_ROUTER_FLAG__,
  __GARFISH_BEFORE_ROUTER_EVENT__,
} from './config';

// Inspection application is activated
const hasActive = (activeWhen: any, path: string) => {
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

  const path: string = getPath(basename, location.pathname);

  const deactiveApps = current!.matched.filter(
    (appInfo) =>
      !hasActive(
        appInfo.activeWhen,
        getPath(appInfo.basename || basename, location.pathname),
      ),
  );

  // Activate the corresponding application
  const activeApps = apps.filter((appInfo) => {
    return hasActive(
      appInfo.activeWhen,
      getPath(appInfo.basename || basename, location.pathname),
    );
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
      async (appInfo) =>
        await deactive(
          appInfo,
          getPath(appInfo.basename || basename, location.pathname),
        ),
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

  console.log(needToActive);

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
