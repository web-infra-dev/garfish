import { warn, makeMap, isObject } from '@garfish/utils';
import { handlerParams } from '../utils';

export function isDataDescriptor(desc?: PropertyDescriptor) {
  if (desc === undefined) return false;
  return 'value' in desc || 'writable' in desc;
}

export function isAccessorDescriptor(desc?: PropertyDescriptor) {
  if (desc === undefined) return false;
  return 'get' in desc || 'set' in desc;
}

export function verifyGetterDescriptor(
  target: any,
  p: PropertyKey,
  newValue: any,
) {
  const desc = Object.getOwnPropertyDescriptor(target, p);
  // https://tc39.es/ecma262/#sec-proxy-object-internal-methods-and-internal-slots-get-p-receiver
  if (desc !== undefined && desc.configurable === false) {
    if (isDataDescriptor(desc) && desc.writable === false) {
      // https://tc39.es/ecma262/#sec-object.is
      if (!Object.is(newValue, desc.value)) {
        if (__DEV__) {
          // prettier-ignore
          warn(`property "${String(p)}" is non-configurable and non-writable.`);
        }
        return 1;
      }
    } else if (isAccessorDescriptor(desc) && desc.get === undefined) {
      return 2;
    }
  }
  return 0;
}

export function verifySetterDescriptor(
  target: any,
  p: PropertyKey,
  newValue: any,
) {
  const desc = Object.getOwnPropertyDescriptor(target, p);
  // https://tc39.es/ecma262/#sec-proxy-object-internal-methods-and-internal-slots-set-p-v-receiver
  if (desc !== undefined && desc.configurable === false) {
    if (isDataDescriptor(desc) && desc.writable === false) {
      // https://tc39.es/ecma262/#sec-object.is
      if (!Object.is(newValue, desc.value)) {
        if (__DEV__) {
          // prettier-ignore
          warn(`property "${String(p)}" is non-configurable and non-writable.`);
        }
        return 1;
      } else {
        return 3;
      }
    } else if (isAccessorDescriptor(desc) && desc.set === undefined) {
      return 2;
    }
  }
  return 0;
}

export function isConstructor(fn: () => void | FunctionConstructor) {
  const fp = fn.prototype;
  const hasConstructor =
    fp && fp.constructor === fn && Object.getOwnPropertyNames(fp).length > 1;
  const functionStr = !hasConstructor && fn.toString();

  return (
    hasConstructor ||
    /^function\s+[A-Z]/.test(functionStr) ||
    /^class\b/.test(functionStr)
  );
}

const buildInProps = makeMap([
  'length',
  'caller',
  'callee',
  'arguments',
  'prototype',
  Symbol.hasInstance,
]);

function transferProps(o: Function, n: Function) {
  for (const key of Reflect.ownKeys(o)) {
    if (buildInProps(key)) continue;
    const desc = Object.getOwnPropertyDescriptor(n, key);
    if (desc && desc.writable) {
      n[key] = o[key];
    }
  }
}

export function bind(fn, context: any) {
  const fNOP = function () {};
  function bound() {
    const args = handlerParams(arguments);
    if (this instanceof bound) {
      const obj = new fn(...args);
      Object.setPrototypeOf(obj, bound.prototype);
      return obj;
    } else {
      return fn.apply(context, args);
    }
  }

  // Record origin function
  bound.$native = fn;
  transferProps(fn, bound);

  if (fn.prototype) {
    // `Function.prototype` doesn't have a prototype property
    fNOP.prototype = fn.prototype;
  }
  bound.prototype = new fNOP();

  // fix "instanceof"
  if (Symbol.hasInstance) {
    Object.defineProperty(bound, Symbol.hasInstance, {
      configurable: true,
      value(instance) {
        const op = fn.prototype;
        return isObject(op) || typeof op === 'function'
          ? instance instanceof fn
          : false;
      },
    });
  }
  return bound;
}
