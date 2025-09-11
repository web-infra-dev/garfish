import {
  hasOwn,
  makeMap,
  isObject,
  findTarget,
  safari13Deal,
  __MockBody__,
  __MockHead__,
} from '@garfish/utils';
import { Sandbox } from '../sandbox';
import { rootElm, sandboxMap } from '../utils';
import { __documentBind__ } from '../symbolTypes';
import { bind, verifyGetterDescriptor, verifySetterDescriptor } from './shared';

const passedKey = makeMap(['title', 'cookie', 'onselectstart', 'ondragstart']);

const queryFunctions = makeMap([
  'querySelector',
  'querySelectorAll',
  'getElementById',
  'getElementsByTagName',
  'getElementsByTagNameNS',
  'getElementsByClassName',
]);

// document proxy getter
export function createGetter(sandbox: Sandbox) {
  return (target: any, p: PropertyKey, receiver?: any) => {
    if (p === 'activeElement') {
      return Reflect.get(document, p);
    }

    const rootNode = rootElm(sandbox);
    const strictIsolation = sandbox.options.strictIsolation;
    const value = hasOwn(target, p)
      ? Reflect.get(target, p, receiver)
      : Reflect.get(document, p);

    // Provide hooks for users to return specific values themselves
    const hooksRes = sandbox.hooks.lifecycle.documentGetter.emit({
      value,
      rootNode,
      propName: p,
      proxyDocument: target,
      customValue: null,
    });

    if (hooksRes.customValue) {
      return hooksRes.customValue;
    }

    const setSandboxRef = (el) => {
      if (isObject(el)) {
        sandboxMap.setElementTag(el, sandbox);
        if (__DEV__) {
          el.__SANDBOX__ = true;
        }
      }
      return el;
    };

    if (rootNode) {
      if (p === 'createElement') {
        return function (tagName, options) {
          const el = value.call(document, tagName, options);
          return setSandboxRef(el);
        };
      }
      if (p === 'createElementNS') {
        return function (...args) {
          const el = value.call(document, ...args);
          return setSandboxRef(el);
        };
      } else if (p === 'createTextNode') {
        return function (data) {
          const el = value.call(document, data);
          return setSandboxRef(el);
        };
      } else if (p === 'head') {
        return findTarget(rootNode, ['head', `div[${__MockHead__}]`]) || value;
      }

      // rootNode is a Shadow dom
      if (strictIsolation) {
        if (p === 'body') {
          // When the node is inserted, if it is a pop-up scene,
          // it needs to be placed globally, so it is not placed outside by default.
          return findTarget(rootNode, ['body', `div[${__MockBody__}]`]);
        } else if (queryFunctions(p)) {
          return p === 'getElementById'
            ? (id) => rootNode.querySelector(`#${CSS.escape(id)}`)
            : rootNode[p].bind(rootNode);
        }
      }
    }

    if (typeof value === 'function') {
      let newValue = hasOwn(value, __documentBind__)
        ? value[__documentBind__]
        : null;
      if (!newValue) newValue = bind(value, document);

      const verifyResult = verifyGetterDescriptor(target, p, newValue);
      if (verifyResult > 0) {
        if (verifyResult === 1) return value;
        if (verifyResult === 2) return undefined;
      }
      value[__documentBind__] = newValue;
      return newValue;
    }
    return value;
  };
}

const safariProxyDocumentDealHandler = safari13Deal();

// document proxy setter
export function createSetter(sandbox) {
  return (target: any, p: PropertyKey, value: any, receiver: any) => {
    const rootNode = rootElm(sandbox);
    const verifyResult = verifySetterDescriptor(
      // prettier-ignore
      typeof p === 'string' && passedKey(p)
        ? document
        : (receiver || target),
      p,
      value,
    );
    if (verifyResult > 0) {
      if (verifyResult === 1 || verifyResult === 2) return false;
      if (verifyResult === 3) return true;
    }

    // Application area of the ban on selected, if users want to ban the global need to set on the main application
    if (p === 'onselectstart' || p === 'ondragstart') {
      if (rootNode) {
        return Reflect.set(rootNode, p, value);
      } else {
        return Reflect.set(document, p, value);
      }
    }

    if (typeof p === 'string' && passedKey(p)) {
      return Reflect.set(document, p, value);
    } else {
      safariProxyDocumentDealHandler.triggerSet();
      return Reflect.set(target, p, value, receiver);
    }
  };
}

// document proxy defineProperty
export function createDefineProperty() {
  return (target: any, p: PropertyKey, descriptor: PropertyDescriptor) => {
    safariProxyDocumentDealHandler.handleDescriptor(descriptor);
    return passedKey(p)
      ? Reflect.defineProperty(document, p, descriptor)
      : Reflect.defineProperty(target, p, descriptor);
  };
}

// document proxy has
export function createHas() {
  return (target: any, p: PropertyKey) => {
    if (p === 'activeElement') return Reflect.has(document, p);
    return hasOwn(target, p) || Reflect.has(document, p);
  };
}
