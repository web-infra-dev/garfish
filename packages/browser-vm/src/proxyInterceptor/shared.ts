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

export function verifySetter(
  proxyTarget: any,
  target: any,
  p: PropertyKey,
  val: any,
  receiver: any,
) {
  const verifyResult = verifySetterDescriptor(
    // prettier-ignore
    proxyTarget ? proxyTarget : (receiver || target),
    p,
    val,
  );

  let result;
  if (verifyResult > 0) {
    if (verifyResult === 1 || verifyResult === 2) result = false;
    if (verifyResult === 3) result = true;
  }

  return result;
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

function safeToString(thing) {
  try {
    return thing.toString();
  } catch (e) {
    return '[toString failed]';
  }
}

export function isConstructor(fn: () => void | FunctionConstructor) {
  const fp = fn.prototype;
  const hasConstructor =
    fp && fp.constructor === fn && Object.getOwnPropertyNames(fp).length > 1;
  const functionStr = !hasConstructor && safeToString(fn);

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

function transferProps(source: Function, target: Function) {
  for (const key of Reflect.ownKeys(source)) {
    if (buildInProps(key)) continue;
    const desc = Object.getOwnPropertyDescriptor(target, key);
    if (desc && desc.writable) {
      target[key] = source[key];
    }
  }
}

// 1. This points to the context of the fn target function
// 2. Assure the goal after the bind function prototype method be replaced after the prototype method would not be affected
// 3. Assure the objective function after the bind instanceof in line with expectations
// 4. Ensure that bind after the objective function of normal static methods available
// 5. After the bind after the objective function is new to instantiate, pointing to their own
export function bind(fn, context: any) {
  const fNOP = function () {};
  function bound(this: any) {
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
