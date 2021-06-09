import {
  warn,
  isCssLink,
  transformUrl,
  callTestCallback,
} from '@garfish/utils';
import { Loader, isOverCapacity } from '../module/loader';

import { HtmlResource, JsResource } from '../module/source';
import { interfaces } from '../interface';

let currentSize = 0;
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

    if (!isOverCapacity(currentSize)) {
      // edge浏览器不知为何不为函数
      requestIdleCallback(() => {
        try {
          loader
            .load(url)
            .then((resManager: HtmlResource | JsResource) => {
              const size = resManager.opts.size;
              currentSize += isNaN(size) ? 0 : size;
              callback && callback(resManager);
              setTimeout(next, 500);
            })
            .catch(throwWarn);
        } catch (e) {
          throwWarn(e);
        }
      });
    } else if (__DEV__) {
      warn(
        'Resource caching capacity of more than ' +
          `"${(currentSize / 1024 / 1024).toFixed()}M".`,
      );
    }
  });
}

export function loadAppResource(loader: Loader, info: interfaces.AppInfo) {
  if (__TEST__) {
    callTestCallback(loadAppResource, info);
  }
  const entry = transformUrl(location.href, info.entry);

  safeLoad(loader, entry, (resManager) => {
    // if (typeof requestIdleCallback !== 'function') return;
    requestIdleCallback(() => {
      if (resManager.type === 'html') {
        const baseUrl = resManager.opts.url;
        const jsNodes = resManager.getVNodesByTagName('script');
        const linkNodes = resManager.getVNodesByTagName('link');

        if (jsNodes) {
          jsNodes.forEach(({ attributes }) => {
            const src = attributes.find(({ key }) => key === 'src');
            if (src && src.value) {
              safeLoad(loader, transformUrl(baseUrl, src.value));
            }
          });
        }

        if (linkNodes) {
          linkNodes.forEach((vnode) => {
            if (isCssLink(vnode)) {
              const href = vnode.attributes.find(({ key }) => key === 'href');
              if (href && href.value) {
                safeLoad(loader, transformUrl(baseUrl, href.value));
              }
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

export default function preloadApp() {
  return function (Garfish: interfaces.Garfish): interfaces.Plugin {
    return {
      name: 'preload',
      version: __VERSION__,
      beforeLoad(appInfo) {
        setRanking(appInfo.name);
        return Promise.resolve(true);
      },
      registerApp(appInfos) {
        setTimeout(
          () => {
            if (isSlowNetwork()) return;
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
