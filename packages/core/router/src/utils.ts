import { RouterHook } from './config';

export async function asyncForEach<T>(
  arr: T[],
  callback: (v: T, k: number, O: T[]) => Promise<any>,
) {
  const length = arr.length;
  let k = 0;
  while (k < length) {
    const kValue = arr[k];
    await callback(kValue, k, arr);
    k++;
  }
}

export function toMiddleWare(to, from, cb: RouterHook) {
  return new Promise((resolve, reject) => {
    try {
      cb(to, from, resolve);
    } catch (err) {
      reject(err);
    }
  });
}

export function getPath(basename: string, pathname?: string) {
  if (basename === '/' || basename === '') {
    return pathname || location.pathname;
  } else {
    return (pathname || location.pathname).replace(
      new RegExp(`^/?${basename}`),
      '',
    );
  }
}
