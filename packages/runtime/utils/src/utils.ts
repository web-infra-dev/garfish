// import Sandbox from '@garfish/sandbox';
import { Sandbox } from 'packages/runtime/browser-vm/src/sandbox';
import { rawWindow } from './raw';

export const noop = () => {};

export function createKey() {
  return Math.random().toString(36).substr(2, 8);
}

export function isObject(val: any) {
  return val && typeof val === 'object';
}

export function isPromise(obj: any) {
  return isObject(obj) && typeof obj.then === 'function';
}

const hasOwnProperty = Object.prototype.hasOwnProperty;
export function hasOwn(obj: any, key: PropertyKey): boolean {
  return hasOwnProperty.call(obj, key);
}

export function def(obj: Object, key: string, value: any) {
  Object.defineProperty(obj, key, {
    get: () => value,
    set: (val: any) => {
      if (__DEV__) {
        if (val !== value) {
          error(`Try to modify a read-only property ${key}`);
        }
      }
    },
    // 测试环境允许 delete
    configurable: __DEV__ ? true : false,
  });
}

// 数组变为对象 `['a'] => { a: true }`
export function makeMap(list: Array<PropertyKey>) {
  const map = Object.create(null);
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return (val) => map[val] as boolean;
}

const warnPrefix = '[Garfish warning]';
const processError = (
  error: string | Error,
  fn: (val: string | Error, isString: boolean) => void,
) => {
  if (typeof error === 'string') {
    error = `${warnPrefix}: ${error}\n\n`;
    fn(error, true);
  } else if (error instanceof Error) {
    if (!error.message.startsWith(warnPrefix)) {
      error.message = `${warnPrefix}: ${error.message}`;
    }
    fn(error, false);
  }
};

export function warn(msg: string | Error) {
  processError(msg, (e, isString) => {
    const warnMsg = isString ? e : (e as Error).message;
    if (__TEST__) {
      callTestCallback(warn, warnMsg);
      return;
    }
    console.warn(warnMsg);
  });
}

export function error(error: string | Error) {
  processError(error, (e, isString) => {
    if (isString) {
      throw new Error(e as string);
    } else {
      throw e;
    }
  });
}

// 将字符串被设置为对象属性名时，会被尝试改造为常量化版本，避免浏览器重复产生缓存
export function internFunc(internalizeString) {
  //  暂时不考虑Hash-collision，https://en.wikipedia.org/wiki/Collision_(computer_science)。v8貌似在16383长度时会发生hash-collision，经过测试后发现正常
  const temporaryOb = {};
  temporaryOb[internalizeString] = true;
  return Object.keys(temporaryOb)[0];
}

export function validURL(str) {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i',
  ); // fragment locator
  return !!pattern.test(str);
}

export function evalWithEnv(code: string, params: Record<string, any>) {
  const keys = Object.keys(params);
  // 不可使用随机值，否则无法作为常量字符串复用
  const randomValKey = '__garfish__exec_temporary__';
  const vales = keys.map((k) => `window.${randomValKey}.${k}`);
  try {
    rawWindow[randomValKey] = params;
    const evalInfo = [
      `;(function(${keys.join(',')}){`,
      `\n}).call(${vales[0]},${vales.join(',')});`,
    ];
    const internalizeString = internFunc(evalInfo[0] + code + evalInfo[1]);
    // (0, eval) 这个表达式会让 eval 在全局作用域下执行
    (0, eval)(internalizeString);
  } catch (e) {
    throw e;
  } finally {
    delete rawWindow[randomValKey];
  }
}

export function nextTick(cb: () => void): void {
  Promise.resolve().then(cb);
}

export function assert(condition: any, msg?: string | Error) {
  if (!condition) {
    error(msg || 'unknow reason');
  }
}

export function toBoolean(val: any) {
  return val === 'false' ? false : Boolean(val);
}

// 调用沙箱的钩子，统一快照和 vm
export function emitSandboxHook(
  hooks: Sandbox['options']['hooks'],
  name: keyof Sandbox['options']['hooks'],
  args: Array<any>,
) {
  const fns: any = hooks?.[name];
  if (fns) {
    if (typeof fns === 'function') {
      return [fns.apply(null, args)];
    } else if (Array.isArray(fns)) {
      return fns.length === 0 ? false : fns.map((fn) => fn.apply(null, args));
    }
  }
  return false;
}

export function remove<T>(list: Array<T> | Set<T>, el: T) {
  if (Array.isArray(list)) {
    const i = list.indexOf(el);
    if (i > -1) {
      list.splice(i, 1);
    }
  } else {
    if (list.has(el)) {
      list.delete(el);
    }
  }
}

export function mixins(...list) {
  return function (target) {
    Object.assign(target.prototype, ...list);
  };
}

// 有些测试 jest.mock 不好测，可用这个工具方法
export function callTestCallback(obj: any, ...args: any[]) {
  if (__TEST__) {
    const oncalled = obj._oncalled;
    if (typeof oncalled === 'function') {
      oncalled.apply(null, args);
    }
  }
}

// 调用沙箱的钩子，统一快照和 vm
// export function emitSandboxHook(
//   hooks: Sandbox['options']['hooks'],
//   name: keyof Sandbox['options']['hooks'],
//   args: Array<any>,
// ) {
//   const fns: any = hooks?.[name];
//   if (fns) {
//     if (typeof fns === 'function') {
//       return [fns.apply(null, args)];
//     } else if (Array.isArray(fns)) {
//       return fns.length === 0 ? false : fns.map((fn) => fn.apply(null, args));
//     }
//   }
//   return false;
// }

// 数组去重，不保证顺序
export function unique<T>(list: Array<T>) {
  const res: Array<T> = [];
  for (let i = 0, len = list.length; i < len; i++) {
    for (let j = i + 1; j < len; j++) {
      if (list[i] === list[j]) {
        j = ++i;
      }
    }
    res.push(list[i]);
  }
  return __TEST__ ? res.sort() : res;
}

export function isPrimitive(val: any) {
  return (
    val === null ||
    typeof val === 'string' ||
    typeof val === 'number' ||
    typeof val === 'bigint' ||
    typeof val === 'symbol' ||
    typeof val === 'boolean' ||
    typeof val === 'undefined'
  );
}

// 深度合并两个对象，能处理循环引用，后面的覆盖前面的，可选数组去重
export function deepMerge<K, T>(o: K, n: T, dp?: boolean) {
  const lRecord = new WeakMap();
  const rRecord = new WeakMap();
  const vRecord = new WeakMap();

  const isArray = Array.isArray;
  const isAllRefs = (a, b) => {
    // 判断 merge 左右两边，不需要用到 vRecord
    if (lRecord.has(a) || rRecord.has(a)) {
      return lRecord.has(b) || rRecord.has(b);
    }
  };

  const clone = (v) => {
    // 深拷贝
    if (isPrimitive(v) || typeof v === 'function') {
      return v;
    } else if (vRecord.has(v)) {
      return vRecord.get(v);
    } else if (lRecord.has(v)) {
      return lRecord.get(v);
    } else if (rRecord.has(v)) {
      return rRecord.get(v);
    } else if (isArray(v)) {
      if (dp) v = unique(v);
      const res = [];
      vRecord.set(v, res);
      for (let i = 0, len = v.length; i < len; i++) {
        res[i] = clone(v[i]);
      }
      return res;
    } else if (typeof v === 'object') {
      const res = {};
      vRecord.set(v, res);
      const keys = Reflect.ownKeys(v);
      keys.forEach((key) => (res[key] = clone(v[key])));
      return res;
    }
  };

  const setValue = (r, k) => {
    if (r.has(k)) {
      return r.get(k);
    } else {
      const val = clone(k);
      if (!isPrimitive(val) && typeof val !== 'function') {
        r.set(k, val);
      }
      return val;
    }
  };

  const mergeObject = (l, r) => {
    const res = {};
    const lkeys = Reflect.ownKeys(l);
    const rkeys = Reflect.ownKeys(r);

    lRecord.set(l, res);
    rRecord.set(r, res);

    lkeys.forEach((key) => {
      const lv = l[key];
      const rv = r[key];

      if (hasOwn(r, key)) {
        if (isArray(lv) && isArray(rv)) {
          const item = clone([].concat(lv, rv));
          res[key] = dp ? unique(item) : item;
        } else if (isObject(lv) && isObject(rv)) {
          res[key] = isAllRefs(lv, rv)
            ? lRecord.get(lv) // 左边右边同一个值，取哪个都行
            : mergeObject(lv, rv);
        } else {
          res[key] = setValue(rRecord, rv);
        }
      } else {
        res[key] = setValue(lRecord, lv);
      }
    });

    rkeys.forEach((key) => {
      if (hasOwn(res, key)) return;
      res[key] = setValue(rRecord, r[key]);
    });

    return res;
  };

  return mergeObject(o, n) as K & T;
}
