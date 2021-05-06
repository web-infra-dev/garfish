(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports)
    : typeof define === 'function' && define.amd
    ? define(['exports'], factory)
    : ((global =
        typeof globalThis !== 'undefined' ? globalThis : global || self),
      factory((global.GarfishRouter = {})));
})(this, function (exports) {
  'use strict';

  /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

  function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  }

  function parseQuery(query = '') {
    const res = {};
    if (query) {
      query
        .slice(1)
        .split('&')
        .map((item) => {
          const pairs = item.split('=');
          res[pairs[0]] = pairs;
        });
    }
    return res;
  }
  function getAppRootPath(basename, path, appInfo) {
    let appRootPath = basename === '/' ? '' : basename;
    if (typeof appInfo.activeWhen === 'string') {
      appRootPath += appInfo.activeWhen;
    } else {
      appRootPath += path.split('').reduce((pre, next) => {
        if (typeof appInfo.activeWhen === 'function' && appInfo.activeWhen(pre))
          return pre + next;
        return pre;
      }, '');
    }
    return appRootPath;
  }

  const __GAR_ROUTER_UPDATE_FLAG__ = '__GAR_ROUTER_UPDATE_FLAG__';
  const RouterConfig = {
    basename: '',
    current: {
      fullPath: '/',
      path: '/',
      matched: [],
      query: {},
    },
    apps: [],
    beforeEach: (to, from, next) => next(),
    afterEach: (to, from, next) => next(),
    active: () => Promise.resolve(),
    deactive: () => Promise.resolve(),
    routerChange: () => {},
    autoRefreshApp: true,
  };
  function set(field, value) {
    RouterConfig[field] = value;
  }
  function setRouterConfig(options) {
    Object.assign(RouterConfig, options);
  }

  function createPopStateEvent(state, originalMethodName) {
    let evt;
    try {
      evt = new PopStateEvent('popstate', { state });
    } catch (err) {
      // IE 11 compatibility
      evt = document.createEvent('PopStateEvent');
      evt.initPopStateEvent('popstate', false, false, state);
    }
    evt.gar = true;
    evt.garTrigger = originalMethodName;
    return evt;
  }
  const callCapturedEventListeners = (type) => {
    const eventArguments = createPopStateEvent(window.history.state, type);
    window.dispatchEvent(eventArguments);
  };
  const handlerParams = function (path, query) {
    if (!path || typeof path !== 'string') return '';
    let url = path;
    if (url[0] !== '/') url = '/' + url;
    if (Object.prototype.toString.call(query) === '[object Object]') {
      const qs = Object.keys(query)
        .map((key) => `${key}=${query[key]}`)
        .join('&');
      url += qs ? '?' + qs : '';
    }
    url = RouterConfig.basename + url;
    if (url[0] !== '/') url = '/' + url;
    return url;
  };
  const push = ({ path, query }) => {
    const url = handlerParams(path, query);
    history.pushState({ [__GAR_ROUTER_UPDATE_FLAG__]: true }, '', url);
  };
  const replace = ({ path, query }) => {
    const url = handlerParams(path, query);
    history.replaceState({ [__GAR_ROUTER_UPDATE_FLAG__]: true }, '', url);
  };

  function asyncForEach(arr, callback) {
    return __awaiter(this, void 0, void 0, function* () {
      const length = arr.length;
      let k = 0;
      while (k < length) {
        const kValue = arr[k];
        yield callback(kValue, k, arr);
        k++;
      }
    });
  }
  function toMiddleWare(to, from, cb) {
    return new Promise((resolve, reject) => {
      try {
        cb(to, from, resolve);
      } catch (err) {
        reject(err);
      }
    });
  }
  function getPath(basename, pathname) {
    if (basename === '/' || basename === '') {
      return pathname || location.pathname;
    } else {
      return (pathname || location.pathname).replace(
        new RegExp(`^/?${basename}`),
        '',
      );
    }
  }

  const normalAgent = () => {
    // 侦听pushState及replaceState，调用linkTo、处理、侦听回退
    // 重写history api方法，在调用时触发事件
    const rewrite = function (type) {
      const hapi = history[type];
      return function () {
        const urlBefore = window.location.pathname + window.location.hash;
        const res = hapi.apply(this, arguments);
        const urlAfter = window.location.pathname + window.location.hash;
        const e = new Event(type.toLowerCase());
        e.arguments = arguments;
        if (urlBefore !== urlAfter) {
          RouterConfig.routerChange && RouterConfig.routerChange(urlAfter);
          linkTo({
            toRouterInfo: {
              fullPath: urlAfter,
              query: parseQuery(location.search),
              path: getPath(RouterConfig.basename, urlAfter),
            },
            fromRouterInfo: {
              fullPath: urlBefore,
              query: parseQuery(location.search),
              path: getPath(RouterConfig.basename, urlBefore),
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
        RouterConfig.routerChange &&
          RouterConfig.routerChange(location.pathname);
        linkTo({
          toRouterInfo: {
            fullPath: location.pathname,
            query: parseQuery(location.search),
            path: getPath(RouterConfig.basename, location.pathname),
          },
          fromRouterInfo: {
            fullPath: RouterConfig.current.fullPath,
            path: RouterConfig.current.path,
            query: RouterConfig.current.query,
          },
          eventType: 'popstate',
        });
      },
      false,
    );
  };
  // Overloading to specify the routing
  const linkTo = ({ toRouterInfo, fromRouterInfo, eventType }) =>
    __awaiter(void 0, void 0, void 0, function* () {
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
      const path = getPath(basename, location.pathname);
      // Inspection application is activated
      const hasActive = (activeWhen) => {
        if (typeof activeWhen === 'string') {
          if (activeWhen[0] !== '/') activeWhen = `/${activeWhen}`;
          const activeWhenArr = activeWhen.split('/');
          const pathArr = path.split('/');
          let flag = true;
          activeWhenArr.forEach((pathItem, index) => {
            if (pathItem && pathItem !== pathArr[index]) {
              flag = false;
            }
          });
          return flag;
        } else {
          return activeWhen(path);
        }
      };
      const deactiveApps = current.matched.filter(
        ({ activeWhen }) => !hasActive(activeWhen),
      );
      // Activate the corresponding application
      const activeApps = apps.filter(({ activeWhen }) => {
        return hasActive(activeWhen);
      });
      const needToActive = activeApps.filter(({ name }) => {
        const isExist = current.matched.some(
          ({ name: cName }) => name === cName,
        );
        return !isExist;
      });
      // router infos
      const to = Object.assign(
        Object.assign({ basename: basename }, toRouterInfo),
        { matched: needToActive },
      );
      const from = Object.assign(
        Object.assign({ basename: basename }, fromRouterInfo),
        { matched: deactiveApps },
      );
      yield toMiddleWare(to, from, beforeEach);
      // Pause the current application of active state
      if (current.matched.length > 0) {
        yield asyncForEach(deactiveApps, (appInfo) =>
          __awaiter(void 0, void 0, void 0, function* () {
            return yield deactive(appInfo, path);
          }),
        );
      }
      // save state
      // Root routing is not loaded by default application
      if (path === '/' || !path) {
        set('current', {
          path: '/',
          fullPath: basename + '/',
          matched: [],
          query: {},
        });
        yield toMiddleWare(to, from, afterEach);
        return;
      }
      setRouterConfig({
        current: {
          fullPath: location.pathname,
          path: getPath(RouterConfig.basename),
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
        ((needToActive.length === 0 && curState[__GAR_ROUTER_UPDATE_FLAG__]) ||
          autoRefreshApp)
      )
        callCapturedEventListeners(eventType);
      yield asyncForEach(needToActive, (appInfo) =>
        __awaiter(void 0, void 0, void 0, function* () {
          // Function using matches character and routing using string matching characters
          const appRootPath = getAppRootPath(basename, path, appInfo);
          yield active(appInfo, appRootPath);
        }),
      );
      if (activeApps.length === 0 && notMatch) notMatch(path);
      yield toMiddleWare(to, from, afterEach);
    });
  const listen = () => {
    normalAgent();
    linkTo({
      toRouterInfo: {
        fullPath: location.pathname,
        path: getPath(RouterConfig.basename),
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

  const beforeEach = (hook) => {
    set('beforeEach', hook);
  };
  const afterEach = (hook) => {
    set('afterEach', hook);
  };
  const routerChange = (hook) => {
    set('routerChange', hook);
  };
  const registerRouter = (Apps) => {
    const unregisterApps = Apps.filter(
      (app) => !RouterConfig.apps.some((item) => app.name === item.name),
    );
    set('apps', RouterConfig.apps.concat(unregisterApps));
  };
  /**
   * 1.注册子应用
   * 2.对应子应用激活，触发激活回调
   * @param Options
   */
  const listenRouterAndReDirect = ({
    apps,
    basename,
    autoRefreshApp,
    active,
    deactive,
    notMatch,
  }) => {
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

  exports.afterEach = afterEach;
  exports.beforeEach = beforeEach;
  exports.default = Router;
  exports.listenRouterAndReDirect = listenRouterAndReDirect;
  exports.push = push;
  exports.registerRouter = registerRouter;
  exports.replace = replace;
  exports.routerChange = routerChange;

  Object.defineProperty(exports, '__esModule', { value: true });
});
//# sourceMappingURL=router.umd.js.map
