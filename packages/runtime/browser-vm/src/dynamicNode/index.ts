import { StyleManager } from '@garfish/loader';
import { __domWrapper__ } from '../symbolTypes';
import { sandboxMap, handlerParams } from '../utils';
import { DynamicNodeProcesser, rawElementMethods } from './processer';

const mountElementMethods = [
  'append',
  'appendChild',
  'insertBefore',
  'insertAdjacentElement',
];

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
      const processer = new DynamicNodeProcesser(el, sandbox, methodName);
      return processer.append(this, arguments, originProcess);
    } else {
      return originProcess();
    }
  };
}

export function makeElInjector() {
  if ((makeElInjector as any).hasInject) return;
  (makeElInjector as any).hasInject = true;

  if (typeof window.Element === 'function') {
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
  }

  if (window.MutationObserver) {
    const rawObserver = window.MutationObserver.prototype.observe;
    MutationObserver.prototype.observe = function () {
      return rawObserver.apply(this, handlerParams(arguments));
    };
  }
}
