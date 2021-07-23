import { warn } from '@garfish/utils';
import { StyleManager } from '@garfish/loader';
import { __domWrapper__ } from '../symbolTypes';
import { sandboxMap, handlerParams } from '../utils';
import { DynamicNodeProcessor, rawElementMethods } from './processor';

const mountElementMethods = [
  'append',
  'appendChild',
  'insertBefore',
  'insertAdjacentElement',
];

const removeElementMethods = ['removeChild'];

function injector(current: Function, methodName: string) {
  return function () {
    // prettier-ignore
    const el = methodName === 'insertAdjacentElement'
      ? arguments[1]
      : arguments[0];
    const sandbox = el && sandboxMap.get(el);
    const originProcess = () => current.apply(this, arguments);

    if (this?.tagName?.toLowerCase() === 'style') {
      const baseUrl = sandbox && sandbox.options.baseUrl;
      if (baseUrl) {
        const manager = new StyleManager(el.textContent);
        manager.correctPath(baseUrl);
        this.textContent = manager.styleCode;
        return originProcess();
      }
    }

    if (sandbox) {
      const processor = new DynamicNodeProcessor(el, sandbox, methodName);
      return processor.append(this, arguments, originProcess);
    } else {
      return originProcess();
    }
  };
}

function injectorRemove(current: Function, methodName: string) {
  return function () {
    // prettier-ignore
    const el = arguments[0];
    const sandbox = el && sandboxMap.get(el);
    const originProcess = () => current.apply(this, arguments);
    if (sandbox) {
      const processor = new DynamicNodeProcessor(el, sandbox, methodName);
      debugger;
      return processor.removeChild(this, arguments, originProcess);
    } else {
      return originProcess();
    }
  };
}

// Handle `ownerDocument` to prevent elements created by `ownerDocument.createElement` from escaping
function handleOwnerDocument() {
  Object.defineProperty(window.Element.prototype, 'ownerDocument', {
    get() {
      const sandbox = this && sandboxMap.get(this);
      const realValue = Reflect.get(
        window.Node.prototype,
        'ownerDocument',
        this,
      );
      return sandbox ? sandbox.global.document : realValue;
    },
    set() {
      __DEV__ && warn('"ownerDocument" is a read-only attribute.');
    },
  });
}

export function makeElInjector() {
  if ((makeElInjector as any).hasInject) return;
  (makeElInjector as any).hasInject = true;

  if (typeof window.Element === 'function') {
    handleOwnerDocument();
    for (const name of mountElementMethods) {
      const fn = window.Element.prototype[name];
      if (typeof fn !== 'function' || fn[__domWrapper__]) {
        continue;
      }
      rawElementMethods[name] = fn;
      const wrapper = injector(fn, name);
      wrapper[__domWrapper__] = true;
      window.Element.prototype[name] = wrapper;
    }

    for (const name of removeElementMethods) {
      const fn = window.Element.prototype[name];
      if (typeof fn !== 'function' || fn[__domWrapper__]) {
        continue;
      }
      rawElementMethods[name] = fn;
      const wrapper = injectorRemove(fn, name);
      wrapper[__domWrapper__] = true;
      window.Element.prototype[name] = wrapper;
    }
  }

  if (window.MutationObserver) {
    const rawObserver = window.MutationObserver.prototype.observe;
    MutationObserver.prototype.observe = function () {
      return rawObserver.apply(this, handlerParams(arguments));
    };
  }
}
