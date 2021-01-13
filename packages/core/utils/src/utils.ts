export const noop = () => {};

export function createKey() {
  return Math.random().toString(36).substr(2, 8);
}

export function def(obj: Object, key: string, value: any) {
  Object.defineProperty(obj, key, {
    get: () => value,
    set: (v: any) => {
      if (v !== value) {
        error(`Try to modify a read-only property ${key}`);
      }
    },
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
  processError(msg, (nv, isString) => {
    console.warn(isString ? nv : (nv as Error).message);
  });
}

export function error(error: string | Error) {
  processError(error, (nv, isString) => {
    if (isString) {
      throw new Error(nv as string);
    } else {
      throw nv;
    }
  });
}

export function assert(condition: any, msg?: string | Error) {
  if (!condition) {
    error(msg || 'unknow reason');
  }
}

export function toBoolean(val: any) {
  return val === 'false' ? false : Boolean(val);
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

const hasOwnProperty = Object.prototype.hasOwnProperty;
export function hasOwn(obj: any, key: PropertyKey) {
  return hasOwnProperty.call(obj, key);
}
