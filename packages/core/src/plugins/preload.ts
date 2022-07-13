import {
  warn,
  Queue,
  isAbsolute,
  transformUrl,
  callTestCallback,
  safeWrapper,
} from '@garfish/utils';
import { Loader, Manager, TemplateManager } from '@garfish/loader';
import { interfaces } from '../interface';

export const storageKey = '__garfishPreloadApp__';

const isMobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );

// Using queues, to avoid interference with the normal request
const requestQueue = new Queue();

const isSlowNetwork = () =>
  (navigator as any).connection
    ? (navigator as any).connection.saveData ||
      /(2|3)g/.test((navigator as any).connection.effectiveType)
    : false;

const idleCallback =
  (window as any).requestIdleCallback || window.requestAnimationFrame;

export const requestIdleCallback =
  __TEST__ || typeof idleCallback !== 'function'
    ? window.setTimeout
    : idleCallback;

// Test size, catch mistakes, avoid preload first screen white during parsing error
function safeLoad({
  loader,
  appName,
  url,
  isModule,
  immediately,
  callback,
}: {
  loader: Loader;
  appName: string;
  url: string;
  isModule: boolean;
  immediately: boolean;
  callback?: (m: Manager) => any;
}) {
  const generateSuccess =
    (next: () => void = () => {}) =>
    ({ resourceManager }) => {
      callback && callback(resourceManager);
      setTimeout(next, 500);
    };

  const generateThrowWarn =
    (next: () => void = () => {}) =>
    (e) => {
      if (__DEV__) {
        warn(e);
        warn(`Preload failed. "${url}"`);
      }
      next();
    };

  const loadResource = (next: () => void = () => {}) => {
    const throwWarn = generateThrowWarn(next);
    const success = generateSuccess(next);
    try {
      if (isModule) {
        loader.loadModule(url).then(success, throwWarn);
      } else {
        loader.load({ scope: appName, url }).then(success, throwWarn);
      }
    } catch (e) {
      throwWarn(e);
      next();
    }
  };

  if (immediately) {
    loadResource();
  } else {
    requestQueue.add((next) => {
      requestIdleCallback(() => loadResource(next));
    });
  }
}

export function loadAppResource(
  loader: Loader,
  info: interfaces.AppInfo,
  immediately = false,
) {
  __TEST__ && callTestCallback(loadAppResource, info);
  const fetchUrl = transformUrl(location.href, info.entry);

  safeLoad({
    loader,
    appName: info.name,
    url: fetchUrl,
    isModule: false,
    immediately,
    callback: (manager) => {
      const loadStaticResource = () => {
        if (manager instanceof TemplateManager) {
          const baseUrl = manager.url;
          const jsNodes = manager.findAllJsNodes();
          const linkNodes = manager.findAllLinkNodes();
          const metaNodes = manager.findAllMetaNodes();

          if (jsNodes) {
            jsNodes.forEach((node) => {
              const src = manager.findAttributeValue(node, 'src');
              src &&
                safeLoad({
                  loader,
                  appName: info.name,
                  url: baseUrl ? transformUrl(baseUrl, src) : src,
                  isModule: false,
                  immediately,
                });
            });
          }
          if (linkNodes) {
            linkNodes.forEach((node) => {
              if (manager.DOMApis.isCssLinkNode(node)) {
                const href = manager.findAttributeValue(node, 'href');
                href &&
                  safeLoad({
                    loader,
                    appName: info.name,
                    url: baseUrl ? transformUrl(baseUrl, href) : href,
                    isModule: false,
                    immediately,
                  });
              }
            });
          }
          if (metaNodes) {
            metaNodes.forEach((node) => {
              if (manager.DOMApis.isRemoteModule(node)) {
                const src = manager.findAttributeValue(node, 'src');
                if (src && isAbsolute(src)) {
                  safeLoad({
                    loader,
                    appName: info.name,
                    url: src,
                    isModule: true,
                    immediately,
                  });
                } else {
                  warn(
                    `The loading of the remote module must be an absolute path. "${src}"`,
                  );
                }
              }
            });
          }
        }
      };
      if (immediately) {
        loadStaticResource();
      } else {
        requestIdleCallback(loadStaticResource);
      }
    },
  });
}

export function getRanking() {
  const str = localStorage.getItem(storageKey);
  if (str) {
    const data = JSON.parse(str);
    return data.sort((a, b) => b.count - a.count);
  }
  return [];
}

export function setRanking(appName: string) {
  const str = localStorage.getItem(storageKey);
  const newCurrent = { appName, count: 1 };

  if (!str) {
    safeWrapper(() =>
      localStorage.setItem(storageKey, JSON.stringify([newCurrent])),
    );
  } else {
    const data = JSON.parse(str);
    const current = data.find((app) => app.appName === appName);
    current ? current.count++ : data.push(newCurrent);
    safeWrapper(() => localStorage.setItem(storageKey, JSON.stringify(data)));
  }
}

const loadedMap = Object.create(null); // Global cache, only load again is enough

declare module '@garfish/core' {
  export default interface Garfish {
    preloadApp: (appName: string) => void;
  }
}

export function GarfishPreloadPlugin() {
  return function (Garfish: interfaces.Garfish): interfaces.Plugin {
    Garfish.preloadApp = (appName) => {
      loadAppResource(Garfish.loader, Garfish.appInfos[appName], true);
    };

    return {
      name: 'preload',
      version: __VERSION__,

      beforeLoad(appInfo) {
        if (Garfish.options.disablePreloadApp) {
          return;
        }
        setRanking(appInfo.name);
      },

      registerApp(appInfos) {
        // Through disablePreloadApp preload is prohibited
        if (Garfish.options.disablePreloadApp) {
          return;
        }
        setTimeout(
          () => {
            if (isMobile || isSlowNetwork()) return;
            const ranking = getRanking();

            for (const { appName } of ranking) {
              if (appInfos[appName] && !loadedMap[appName]) {
                loadedMap[appName] = true;
                loadAppResource(Garfish.loader, appInfos[appName]);
              }
            }

            for (const key in appInfos) {
              if (!loadedMap[key]) {
                loadAppResource(Garfish.loader, appInfos[key]);
              }
            }
          },
          __TEST__ ? 0 : 5000,
        );
      },
    };
  };
}
