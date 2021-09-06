import { hasOwn, makeMap, isObject, findTarget } from '@garfish/utils';
import { Sandbox } from '../sandbox';
import { rootElm, sandboxMap } from '../utils';
import { __documentBind__ } from '../symbolTypes';
import { bind, verifyGetterDescriptor, verifySetterDescriptor } from './shared';

const passedKey = makeMap(['title', 'cookie']);

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

    if (rootNode) {
      if (p === 'createElement') {
        return function (tagName, options) {
          const el = value.call(document, tagName, options);
          if (isObject(el)) {
            sandboxMap.set(el, sandbox);
            if (__DEV__) {
              el.__SANDBOX__ = true;
            }
          }
          return el;
        };
      } else if (p === 'head') {
        return (
          findTarget(rootNode, ['head', 'div[__garfishmockhead__]']) || value
        );
      }

      // rootNode is a Shadow dom
      if (strictIsolation) {
        if (p === 'body') {
          // When the node is inserted, if it is a pop-up scene,
          // it needs to be placed globally, so it is not placed outside by default.
          return findTarget(rootNode, ['body', 'div[__garfishmockbody__]']);
        } else if (queryFunctions(p)) {
          return p === 'getElementById'
            ? (id) => rootNode.querySelector(`#${id}`)
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
    if (p === 'onselectstart') {
      if (rootNode) {
        return Reflect.set(rootNode, p, value);
      } else {
        return Reflect.set(document, p, value);
      }
    }

    return typeof p === 'string' && passedKey(p)
      ? Reflect.set(document, p, value)
      : Reflect.set(target, p, value, receiver);
  };
}

// document proxy defineProperty
export function createDefineProperty() {
  return (target: any, p: PropertyKey, descriptor: PropertyDescriptor) => {
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
