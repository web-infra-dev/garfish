import { AppInfo } from './config';

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

export function find(arr: Array<Function>, func: Function) {
  for (let i = 0; i < arr.length; i++) {
    if (func(arr[i])) {
      return arr[i];
    }
  }

  return null;
}

export function getAppRootPath(basename, path, appInfo: AppInfo) {
  let appRootPath = basename === '/' ? '' : basename;
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
