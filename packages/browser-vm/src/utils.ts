import { hasOwn, makeMap, nextTick } from '@garfish/utils';
import { Sandbox } from './sandbox';
import { FakeWindow } from './types';
import {
  __proxyNode__,
  __sandboxMap__,
  __elementSandboxTag__,
} from './symbolTypes';

// https://tc39.es/ecma262/#sec-function-properties-of-the-global-object
const esGlobalMethods =
  // Function properties of the global object // Function properties of the global object
  (
    'eval,isFinite,isNaN,parseFloat,parseInt,' +
    // URL handling functions
    'decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
    // Constructor properties of the global object
    'Array,ArrayBuffer,BigInt,BigInt64Array,BigUint64Array,Boolean,DataView,Date,Error,EvalError,' +
    'FinalizationRegistry,Float32Array,Float64Array,Function,Int8Array,Int16Array,Int32Array,Map,Number,' +
    'Object,Promise,Proxy,RangeError,ReferenceError,RegExp,Set,SharedArrayBuffer,String,Symbol,SyntaxError,' +
    'TypeError,Uint8Array,Uint8ClampedArray,Uint16Array,Uint32Array,URIError,WeakMap,WeakRef,WeakSet,' +
    // Other Properties of the Global Object
    'Atomics,JSON,Math,Reflect,'
  ).split(',');

const nativeCodeMethods = 'hasOwnProperty,'.split(',');

export const isEsGlobalMethods = makeMap(esGlobalMethods);
export const isNativeCodeMethods = makeMap(nativeCodeMethods);

// Need to optimize, avoid from the with
// Can't filter document, eval keywords, such as document in handling parentNode useful
export const optimizeMethods = [...esGlobalMethods].filter((v) => v !== 'eval');

// The sandbox may be used alone, to ensure that the `sandboxMap` is globally unique,
// because we will only rewrite `appendChild` once
let sandboxList: Map<number, Sandbox> = new Map();
if (!(window as FakeWindow)[__sandboxMap__]) {
  (window as FakeWindow)[__sandboxMap__] = sandboxList;
} else {
  sandboxList = (window as FakeWindow)[__sandboxMap__];
}

export const sandboxMap = {
  sandboxMap: sandboxList,

  get(element: Element): Sandbox {
    if (!element) return;
    const sandboxId = element[__elementSandboxTag__];
    if (typeof sandboxId !== 'number') return;
    return this.sandboxMap.get(sandboxId);
  },

  setElementTag(element: Element, sandbox: Sandbox) {
    if (!element) return;
    element[__elementSandboxTag__] = sandbox.id;
  },

  set(sandbox: Sandbox) {
    if (this.sandboxMap.get(sandbox.id)) return;
    this.sandboxMap.set(sandbox.id, sandbox);
  },

  del(sandbox: Sandbox) {
    this.sandboxMap.delete(sandbox.id);
  },
};

export function handlerParams(args: IArguments | Array<any>) {
  args = Array.isArray(args) ? args : Array.from(args);
  return args.map((v) => {
    return v && v[__proxyNode__] ? v[__proxyNode__] : v;
  });
}

// Container node, because it changes all the time, take it as you use it
export function rootElm(sandbox: Sandbox) {
  const container = sandbox && sandbox.options.el;
  return container && container();
}

export function isInIframe() {
  return window?.parent?.__GARFISH__ !== window?.__GARFISH__;
}

// Copy "window" and "document"
export function createFakeObject(
  target: Record<PropertyKey, any>,
  filter?: (key: PropertyKey) => boolean,
  isWritable?: (key: PropertyKey) => boolean,
) {
  const fakeObject = {};
  const propertyMap = {};
  const storageBox = Object.create(null); // Store changed value
  const propertyNames = Object.getOwnPropertyNames(target);
  const def = (p: string) => {
    const descriptor = Object.getOwnPropertyDescriptor(target, p);

    if (descriptor?.configurable) {
      const hasGetter = hasOwn(descriptor, 'get');
      const hasSetter = hasOwn(descriptor, 'set');
      const canWritable = typeof isWritable === 'function' && isWritable(p);

      if (hasGetter) {
        // prettier-ignore
        descriptor.get = () => hasOwn(storageBox, p)
          ? storageBox[p]
          : target[p];
      }
      if (hasSetter) {
        descriptor.set = (val) => {
          storageBox[p] = val;
          return true;
        };
      }
      if (canWritable) {
        if (descriptor.writable === false) {
          descriptor.writable = true;
        } else if (hasGetter) {
          descriptor.set = (val) => {
            storageBox[p] = val;
            return true;
          };
        }
      }
      Object.defineProperty(fakeObject, p, Object.freeze(descriptor));
    }
  };
  propertyNames.forEach((p) => {
    propertyMap[p] = true;
    typeof filter === 'function' ? !filter(p) && def(p) : def(p);
  });
  // "prop" maybe in prototype chain
  for (const prop in target) {
    !propertyMap[prop] && def(prop);
  }
  return fakeObject as any;
}

let setting = true;
export function microTaskHtmlProxyDocument(proxyDocument) {
  // The HTML parent node into agent for the document
  // In micro tasks replace primary node
  const html = document.children[0];
  if (html && html.parentNode !== proxyDocument) {
    Object.defineProperty(html, 'parentNode', {
      value: proxyDocument,
      configurable: true,
    });

    if (setting) {
      setting = false;
      // Do not use micro tasks, Element will appear in the task placed in nextTick after node
      nextTick(() => {
        setting = true;
        Object.defineProperty(html, 'parentNode', {
          value: document,
          configurable: true,
        });
      });
    }
  }
}

export function isStyledComponentsLike(element: HTMLStyleElement) {
  // A styled-components liked element has no textContent but keep the rules in its sheet.cssRules.
  return (
    element instanceof HTMLStyleElement &&
    !element.textContent &&
    element.sheet?.cssRules.length
  );
}
