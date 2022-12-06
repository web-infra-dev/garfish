import { getPath, parseQuery } from './utils/urlUt';
import { createEvent } from './utils';
import {
  RouterConfig,
  __GARFISH_ROUTER_UPDATE_FLAG__,
  __GARFISH_ROUTER_FLAG__,
  __GARFISH_BEFORE_ROUTER_EVENT__,
} from './config';
import CustomEvent from './utils/customEvent';
import { linkTo } from './linkTo';

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
      return function (this: History) {
        const urlBefore = window.location.pathname + window.location.hash;
        const stateBefore = history?.state;
        const res = hapi.apply(this, arguments);
        const urlAfter = window.location.pathname + window.location.hash;
        const stateAfter = history?.state;

        const e = createEvent(type);
        (e as any).arguments = arguments;

        if (
          urlBefore !== urlAfter ||
          JSON.stringify(stateBefore) !== JSON.stringify(stateAfter)
        ) {
          window.dispatchEvent(
            new CustomEvent(__GARFISH_BEFORE_ROUTER_EVENT__, {
              detail: {
                toRouterInfo: {
                  fullPath: urlAfter,
                  href: location.href,
                  query: parseQuery(location.search),
                  path: getPath(RouterConfig.basename!, urlAfter),
                  state: stateAfter,
                },
                fromRouterInfo: {
                  fullPath: urlBefore,
                  query: RouterConfig.current!.query,
                  href: RouterConfig.current!.href,
                  path: getPath(RouterConfig.basename!, urlBefore),
                  state: stateBefore,
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
      function (event) {
        // Stop trigger collection function, fire again match rendering
        if (event && typeof event === 'object' && (event as any).garfish)
          return;
        if (history.state && typeof history.state === 'object')
          delete history.state[__GARFISH_ROUTER_UPDATE_FLAG__];
        window.dispatchEvent(
          new CustomEvent(__GARFISH_BEFORE_ROUTER_EVENT__, {
            detail: {
              toRouterInfo: {
                fullPath: location.pathname,
                href: location.href,
                query: parseQuery(location.search),
                path: getPath(RouterConfig.basename!),
              },
              fromRouterInfo: {
                fullPath: RouterConfig.current!.fullPath,
                path: getPath(
                  RouterConfig.basename!,
                  RouterConfig.current!.path,
                ),
                href: RouterConfig.current!.href,
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

export const initRedirect = () => {
  linkTo({
    toRouterInfo: {
      fullPath: location.pathname,
      href: location.href,
      path: getPath(RouterConfig.basename!),
      query: parseQuery(location.search),
      state: history.state,
    },
    fromRouterInfo: {
      fullPath: '/',
      href: '',
      path: '/',
      query: {},
      state: {},
    },
    eventType: 'pushState',
  });
};

export const listen = () => {
  normalAgent();
  initRedirect();
};
