export * from './sandbox';
import {
  makeMap,
  nextTick,
  rawObject,
  rawDocument,
  rawObjectDefineProperty,
} from '@garfish/utils';
import { __proxyNode__ } from '../symbolTypes';

// https://tc39.es/ecma262/#sec-function-properties-of-the-global-object
const esGlobalMethods = // Function properties of the global object
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

export const isEsGlobalMethods = makeMap(esGlobalMethods);

// Need to optimize, avoid from the with
// Can't filter document, eval keywords, such as document in handling parentNode useful
export const optimizeMethods = [...esGlobalMethods].filter((v) => v !== 'eval');

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
