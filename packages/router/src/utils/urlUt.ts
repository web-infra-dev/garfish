import { interfaces } from '@garfish/core';

export function formatQuery(query: { [props: string]: string } = {}) {
  const qs = Object.keys(query)
    .map((key) => `${key}=${query[key]}`)
    .join('&');
  return qs ? '?' + qs : '';
}

export function parseQuery(query = '') {
  const res: { [props: string]: string[] } = {};
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

/**
 * 解析出子应用的根路由,取得app1
 * 解析内容：
 *    /basename/app1/about、basename/app1、basename/app1/、/app1/、/app1/about、app1/
 *    #/app1、/#/app1/、/#/app1/detail/、/#/app1/detail
 * @param path
 */
export function parsePath(path: string) {
  const matches = path.match(new RegExp('^/([^/]+)')) || [];
  return `/${matches[1] || ''}`;
}

export function find(arr: Array<Function>, func: Function) {
  for (let i = 0; i < arr.length; i++) {
    if (func(arr[i])) {
      return arr[i];
    }
  }

  return null;
}

export function getPath(basename: string = '/', pathname?: string) {
  if (basename === '/' || basename === '') {
    return pathname || location.pathname;
  } else {
    return (pathname || location.pathname).replace(
      new RegExp(`^/?${basename}`),
      '',
    );
  }
}

export function getAppRootPath(appInfo: interfaces.AppInfo) {
  const path = getPath(appInfo.basename, location.pathname);
  let appRootPath = appInfo.basename === '/' ? '' : (appInfo.basename || '');
  if (typeof appInfo.activeWhen === 'string') {
    appRootPath += appInfo.activeWhen;
  } else {
    appRootPath += path.split('').reduce((pre, next) => {
      // 匹配
      if (typeof appInfo.activeWhen === 'function' && !appInfo.activeWhen(pre))
        return pre + next;
      return pre;
    }, '');
  }
  return appRootPath;
}
