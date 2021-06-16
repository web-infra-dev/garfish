import {
  warn,
  isCssLink,
  transformUrl,
  callTestCallback,
  TemplateManager,
} from '@garfish/utils';
import { Loader } from '@garfish/loader';
import { interfaces } from '../interface';

const storageKey = '__garfishPreloadApp__';

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  navigator.userAgent,
);

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

// Using queues, to avoid interference with the normal request
export const requestQueue = {
  fx: [],
  init: true,
  lock: false,

  add(fn: (...args: any) => any) {
    this.fx.push(fn);
    if (this.init) {
      this.lock = false;
      this.init = false;
      this.next();
    }
  },

  next() {
    if (!this.lock) {
      this.lock = true;
      if (this.fx.length === 0) {
        this.init = true;
      }
      const fn = this.fx.shift();
      if (fn) {
        fn(() => {
          this.lock = false;
          this.next();
        });
      }
    }
  },
};

// Test size, catch mistakes, avoid preload first screen white during parsing error
function safeLoad(
  loader: Loader,
  appName: string,
  url: string,
  callback?: (...args: any) => any,
) {
  requestQueue.add((next) => {
    const throwWarn = (e) => {
      next();
      if (__DEV__) {
        warn(e);
        warn(`Preload failed. "${url}"`);
      }
    };

    // edge浏览器不知为何不为函数
    requestIdleCallback(() => {
      try {
        loader
          .load(appName, url)
          .then((manager) => {
            callback && callback(manager);
            setTimeout(next, 500);
          })
          .catch(throwWarn);
      } catch (e) {
        throwWarn(e);
      }
    });
  });
}

export function loadAppResource(loader: Loader, info: interfaces.AppInfo) {
  __TEST__ && callTestCallback(loadAppResource, info);
  const fetchUrl = transformUrl(location.href, info.entry);

  safeLoad(loader, info.name, fetchUrl, (manager) => {
    requestIdleCallback(() => {
      if (manager instanceof TemplateManager) {
        const baseUrl = manager.url;
        const jsNodes = manager.findAllJsNodes();
        const linkNodes = manager.findAllLinkNodes();
        if (jsNodes) {
          jsNodes.forEach((node) => {
            const src = manager.findAttributeValue(node, 'src');
            src && safeLoad(loader, info.name, transformUrl(baseUrl, src));
          });
        }
        if (linkNodes) {
          linkNodes.forEach((node) => {
            if (manager.DOMApis.isCssLinkNode(node)) {
              const href = manager.findAttributeValue(node, 'href');
              href && safeLoad(loader, info.name, transformUrl(baseUrl, href));
            }
          });
        }
      }
    });
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
    localStorage.setItem(storageKey, JSON.stringify([newCurrent]));
  } else {
    const data = JSON.parse(str);
    const current = data.find((app) => app.appName === appName);
    current ? current.count++ : data.push(newCurrent);
    localStorage.setItem(storageKey, JSON.stringify(data));
  }
}

const loadedMap = Object.create(null); // Global cache, only load again is enough

export function GarfishPreloadPlugin() {
  return function (Garfish: interfaces.Garfish): interfaces.Plugin {
    return {
      name: 'preload',
      version: __VERSION__,
      beforeLoad(appInfo) {
        setRanking(appInfo.name);
        return Promise.resolve(true);
      },
      registerApp(appInfos) {
        console.log('preload registerApp', appInfos);
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
