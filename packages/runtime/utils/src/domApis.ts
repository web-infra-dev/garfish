import { noop, warn } from './utils';

// Scheme: https://tools.ietf.org/html/rfc3986#section-3.1
// Absolute URL: https://tools.ietf.org/html/rfc3986#section-4.3
export function isAbsolute(url: string) {
  // `c:\\` 这种 case 返回 false，在浏览器中使用本地图片，应该用 file 协议
  if (!/^[a-zA-Z]:\\/.test(url)) {
    if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url)) {
      return true;
    }
  }
  return false;
}

export function transformUrl(resolvePath: string, curPath: string) {
  const baseUrl = new URL(resolvePath, location.href);
  const realPath = new URL(curPath, baseUrl.href);
  return realPath.href;
}

export function findTarget(el: Element | ShadowRoot, selectors: Array<string>) {
  for (const s of selectors) {
    const target = el.querySelector(s);
    if (target) return target;
  }
  return el;
}

export function setDocCurrentScript(
  target,
  code: string,
  define?: boolean,
  url?: string,
  async?: boolean,
) {
  if (!target) return noop;
  const el = document.createElement('script');
  if (async) {
    el.setAttribute('async', 'true');
  }

  if (url) {
    el.setAttribute('src', url);
  } else if (code) {
    el.textContent = code;
  }

  const set = (val) => {
    try {
      if (define) {
        Object.defineProperty(target, 'currentScript', {
          value: val,
          writable: true,
          configurable: true,
        });
      } else {
        target.currentScript = val;
      }
    } catch (e) {
      if (__DEV__) {
        warn(e);
      }
    }
  };

  set(el);
  return () => set(null);
}
