export * from './sandbox';
import {
  isObject,
  makeMap,
  rawObject,
  rawObjectDefineProperty,
} from '@garfish/utils';
import { __proxyNode__ } from '../symbolTypes';

// es 的函数不需要修正 this 和处理 elm 参数
// https://tc39.es/ecma262/#sec-function-properties-of-the-global-object
export const isEsMethod = makeMap([
  // Function properties of the global object
  'eval',
  'isFinite',
  'isNaN',
  'parseFloat',
  'parseInt',
  // URL handling functions
  'decodeURI',
  'decodeURIComponent',
  'encodeURI',
  'encodeURIComponent',
  'encodeURI',
  'encodeURIComponent',
  // Constructor properties of the global object
  'Array',
  'ArrayBuffer',
  'BigInt',
  'BigInt64Array',
  'BigUint64Array',
  'Boolean',
  'DataView',
  'Date',
  'Error',
  'EvalError',
  'FinalizationRegistry',
  'Float32Array',
  'Float64Array',
  'Function',
  'Int8Array',
  'Int16Array',
  'Int32Array',
  'Map',
  'Number',
  'Object',
  'Promise',
  'Proxy',
  'RangeError',
  'ReferenceError',
  'RegExp',
  'Set',
  'SharedArrayBuffer',
  'String',
  'Symbol',
  'SyntaxError',
  'TypeError',
  'Uint8Array',
  'Uint8ClampedArray',
  'Uint16Array',
  'Uint32Array',
  'URIError',
  'WeakMap',
  'WeakRef',
  'WeakSet',
]);

export const handlerParams = function (args: IArguments | Array<any>) {
  args = Array.isArray(args) ? args : Array.from(args);
  return args.map((v) => {
    return v && v[__proxyNode__] ? v[__proxyNode__] : v;
  });
};

const isFilterProps = makeMap([
  'length',
  'caller',
  'callee',
  'arguments',
  'prototype',
  Symbol.hasInstance,
]);

export function transferProps(o: Function, n: Function) {
  const copy = (names) => {
    for (const key of names) {
      if (!isFilterProps(key)) {
        const des = rawObject.getOwnPropertyDescriptor(n, key);
        if (des) {
          des.writable && (n[key] = o[key]);
        } else {
          n[key] = o[key];
        }
      }
    }
  };
  copy(rawObject.getOwnPropertyNames(o));
  copy(rawObject.getOwnPropertySymbols(o));
}

// 我们暂时没法通过是否是 constructor 判断，因为要处理参数
export function bind(fn, context: any) {
  const fNOP = function () {};
  function bound() {
    const args = handlerParams(arguments);
    return this instanceof bound ? new fn(...args) : fn.apply(context, args);
  }

  // 记录原来的函数
  bound._native = fn;
  transferProps(fn, bound);

  if (fn.prototype) {
    // `Function.prototype` doesn't have a prototype property
    fNOP.prototype = fn.prototype; // 这里应该要 copy 属性和方法才对
  }
  bound.prototype = new fNOP();

  // 经过包装后，需要修正 instanceof 操作
  if (Symbol.hasInstance) {
    rawObjectDefineProperty(bound, Symbol.hasInstance, {
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
