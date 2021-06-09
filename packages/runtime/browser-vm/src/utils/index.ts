export * from './sandbox';
import {
  makeMap,
  isObject,
  rawObject,
  rawDocument,
  rawObjectDefineProperty,
  nextTick,
} from '@garfish/utils';
import { __proxyNode__ } from '../symbolTypes';

// https://tc39.es/ecma262/#sec-function-properties-of-the-global-object
const esNames = // Function properties of the global object
(
  'eval,isFinite,isNaN,parseFloat,parseInt' +
  // URL handling functions
  'decodeURI,decodeURIComponent,encodeURI,encodeURIComponent' +
  // Constructor properties of the global object
  'Array,ArrayBuffer,BigInt,BigInt64Array,BigUint64Array,Boolean,DataView,Date,Error,EvalError,' +
  'FinalizationRegistry,Float32Array,Float64Array,Function,Int8Array,Int16Array,Int32Array,Map,Number' +
  'Object,Promise,Proxy,RangeError,ReferenceError,RegExp,Set,SharedArrayBuffer,String,Symbol,SyntaxError' +
  'TypeError,Uint8Array,Uint8ClampedArray,Uint16Array,Uint32Array,URIError,WeakMap,WeakRef,WeakSet' +
  //  Other Properties of the Global Object
  'Atomics,JSON,Math,Reflect'
).split(',');

export const isEsMethod = makeMap(esNames);

// Need to optimize, avoid from the with
// Can't filter document, eval keywords, such as document in handling parentNode useful
export const optimizeMethods = [...esNames].filter((v) => v !== 'eval');

export function isConstructor(fn: () => void | FunctionConstructor) {
  const fp = fn.prototype;
  const hasConstructor =
    fp && fp.constructor === fn && rawObject.getOwnPropertyNames(fp).length > 1;
  const functionStr = !hasConstructor && fn.toString();

  return (
    hasConstructor ||
    /^function\s+[A-Z]/.test(functionStr) ||
    /^class\b/.test(functionStr)
  );
}

export function handlerParams(args: IArguments | Array<any>) {
  args = Array.isArray(args) ? args : Array.from(args);
  return args.map((v) => {
    return v && v[__proxyNode__] ? v[__proxyNode__] : v;
  });
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
    const desc = rawObject.getOwnPropertyDescriptor(n, key);
    if (desc && desc.writable) {
      n[key] = o[key];
    }
  }
}

// 我们暂时没法通过是否是 constructor 判断，因为要处理参数
export function bind(fn, context: any) {
  const fNOP = function () {};
  function bound() {
    const args = handlerParams(arguments);
    if (this instanceof bound) {
      const obj = new fn(...args);
      rawObject.setPrototypeOf(obj, bound.prototype);
      return obj;
    } else {
      return fn.apply(context, args);
    }
  }

  // 记录原来的函数
  bound._native = fn;
  transferProps(fn, bound);

  if (fn.prototype) {
    // `Function.prototype` doesn't have a prototype property
    fNOP.prototype = fn.prototype;
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

let setting = true;
let tempEl = null;
export function macroTaskProxyDocument(el, proxyDocument) {
  if (!el) return;
  // 若从子应用的根节点中获取parentNode，可能存在从当前环境向上查询到document，产生逃逸出代理document的情况
  // 获取节点parentNode时将html的父节点变为代理document
  // 在微任务时替换成原生节点
  const html = rawDocument.children[0];
  if (el.parentNode !== proxyDocument) tempEl = el.parentNode;
  const defineFn = function () {
    if (html && html.parentNode !== proxyDocument) {
      rawObjectDefineProperty(html, 'parentNode', {
        value: proxyDocument,
        configurable: true,
      });
      if (setting) {
        setting = false;
        // 不可使用微任务，Element中出现将经过节点后的任务放置了nextTick中
        setTimeout(() => {
          setting = true;
          rawObjectDefineProperty(html, 'parentNode', {
            value: rawDocument,
            configurable: true,
          });
        });
      }
    }
    return tempEl;
  };

  const desc = Object.getOwnPropertyDescriptor(el, 'parentNode');
  if (desc?.get === defineFn) return;
  rawObjectDefineProperty(el, 'parentNode', {
    get: defineFn,
    configurable: true,
  });
}

export function microTaskHtmlProxyDocument(proxyDocument) {
  // The HTML parent node into agent for the document
  // In micro tasks replace primary node
  const html = rawDocument.children[0];
  if (html && html.parentNode !== proxyDocument) {
    rawObjectDefineProperty(html, 'parentNode', {
      value: proxyDocument,
      configurable: true,
    });

    if (setting) {
      setting = false;
      // // Do not use micro tasks, Element will appear in the task placed in nextTick after node
      nextTick(() => {
        setting = true;
        rawObjectDefineProperty(html, 'parentNode', {
          value: rawDocument,
          configurable: true,
        });
      });
    }
  }
}
