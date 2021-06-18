import { hasOwn, makeMap, isObject, findTarget } from '@garfish/utils';
import { Sandbox } from '../sandbox';
import { __documentBind__ } from '../symbolTypes';
import { rootElm, setElementSandbox } from '../utils';
import { bind, verifyGetterDescriptor, verifySetterDescriptor } from './shared';

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
    const rootEl = rootElm(sandbox);
    const strictIsolation = sandbox.options.strictIsolation;
    const value = hasOwn(target, p)
      ? Reflect.get(target, p, receiver)
      : Reflect.get(document, p);

    if (rootEl) {
      if (p === 'createElement') {
        return function (tagName, options) {
          const el = value.call(document, tagName, options);
          if (isObject(el)) setElementSandbox(el, sandbox);
          return el;
        };
      }

      // rootEl is a Shadow dom
      if (strictIsolation) {
        if (p === 'head') {
          return findTarget(rootEl, ['head', 'div[__GarfishMockHead__]']);
        }
        if (p === 'body') {
          return findTarget(rootEl, ['body', 'div[__GarfishMockBody__]']);
        }
        if (queryFunctions(p)) {
          return p === 'getElementById'
            ? (id) => rootEl.querySelector(`#${id}`)
            : rootEl[p].bind(rootEl);
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
export function createSetter() {
  return (target: any, p: PropertyKey, value: any, receiver: any) => {
    const passedKey = makeMap(['title', 'cookie']);
    const verifyResult = verifySetterDescriptor(
      // prettier-ignore
      typeof p === 'string' && passedKey(p)
        ? document
        : receiver
          ? receiver
          : target,
      p,
      value,
    );
    if (verifyResult > 0) {
      if (verifyResult === 1 || verifyResult === 2) return false;
      if (verifyResult === 3) return true;
    }

    return typeof p === 'string' && passedKey(p)
      ? Reflect.set(document, p, value)
      : Reflect.set(target, p, value, receiver);
  };
}

// document proxy defineProperty
export function createDefineProperty() {
  return (target: any, p: PropertyKey, descriptor: PropertyDescriptor) => {
    return p === 'cookie'
      ? Reflect.defineProperty(document, p, descriptor)
      : Reflect.defineProperty(target, p, descriptor);
  };
}
