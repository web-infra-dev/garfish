import { warn, isCssLink, transformUrl } from '@garfish/utils';
import { AppInfo } from './config';
import { Garfish } from './garfish';
import { REGISTER_APP } from './eventFlags';
import {
  Loader,
  JsResource,
  HtmlResource,
  isOverCapacity,
} from './module/loader';

let currentSize = 0;
const storageKey = '__garfishPreloadApp__';

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  navigator.userAgent,
);

const isSlowNetwork = () =>
  (navigator as any).connection
    ? (navigator as any).connection.saveData ||
      /([23])g/.test((navigator as any).connection.effectiveType)
    : false;

const requestIdleCallback =
  (window as any).requestIdleCallback || window.requestAnimationFrame;

// 使用队列，避免干扰正常的请求
const requestQueue = {
  fx: [],
  init: true,
  lock: false,

  add(fn: AnyFunction) {
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

// 检测大小，捕获错误，避免预加载解析错误导致首屏白屏
function safeLoad(loader: Loader, url: string, callback?: AnyFunction) {
  requestQueue.add((next) => {
    const throwWarn = (e) => {
      next();
      if (__DEV__) {
        warn(e);
        warn(`Preload failed. "${url}"`);
      }
    };

    if (!isOverCapacity(currentSize)) {
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
        `Resource caching capacity of more than "${(
          currentSize / 1024
        ).toFixed()}kb".`,
      );
    }
  });
}

export function loadAppResource(loader: Loader, info: AppInfo) {
  safeLoad(loader, info.entry, (resManager) => {
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

export function preloadApp(context: Garfish) {
  if (isMobile) return;
  context.on(REGISTER_APP, (appInfos: Record<string, AppInfo>) => {
    // 延时预加载，预留给首屏渲染的的时间
    setTimeout(() => {
      if (isSlowNetwork()) return;
      const loadedMap = Object.create(null);
      const ranking = getRanking();

      for (const { appName } of ranking) {
        if (appInfos[appName]) {
          loadedMap[appName] = true;
          loadAppResource(context.loader, appInfos[appName]);
        }
      }

      for (const key in appInfos) {
        if (!loadedMap[key]) {
          loadAppResource(context.loader, appInfos[key]);
        }
      }
    }, 5000);
  });
}
