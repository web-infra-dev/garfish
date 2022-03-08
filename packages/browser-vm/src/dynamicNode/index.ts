import { warn } from '@garfish/utils';
import { StyleManager } from '@garfish/loader';
import { __domWrapper__ } from '../symbolTypes';
import { injectHandlerParams } from './processParams';
import { DynamicNodeProcessor, rawElementMethods } from './processor';
import { isInIframe, sandboxMap, isStyledComponentsLike } from '../utils';

const mountElementMethods = [
  'append',
  'appendChild',
  'insertBefore',
  'insertAdjacentElement',
];
const removeChildElementMethods = ['removeChild'];

function injector(current: Function, methodName: string) {
  return function (this: Element) {
    // prettier-ignore
    const el = methodName === 'insertAdjacentElement'
      ? arguments[1]
      : arguments[0];
    const sandbox = sandboxMap.get(el);
    const originProcess = () => current.apply(this, arguments);

    if (el && this?.tagName?.toLowerCase() === 'style') {
      const { baseUrl, namespace, styleScopeId } = sandbox?.options || {};
      const manager = new StyleManager(el.textContent);

      manager.correctPath(baseUrl);
      manager.setScope({
        appName: namespace,
        rootElId: styleScopeId(),
      });
      el.textContent = manager.transformCode(manager.styleCode);
      return originProcess();
    }

    if (sandbox) {
      const processor = new DynamicNodeProcessor(el, sandbox, methodName);
      return processor.append(this, arguments, originProcess);
    } else {
      return originProcess();
    }
  };
}

function injectorRemoveChild(current: Function, methodName: string) {
  return function (this: Element) {
    const el = arguments[0];
    const sandbox = el && sandboxMap.get(el);
    const originProcess = () => {
      // Sandbox may have applied sub dom side effects to delete
      // by removeChild deleted by the tag determine whether have been removed
      return current.apply(this, arguments);
    };
    if (sandbox) {
      const processor = new DynamicNodeProcessor(el, sandbox, methodName);
      return processor.removeChild(this, originProcess);
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
    // iframe can read html container this can't point to proxyDocument has Illegal invocation error
    // if (!isInIframe()) handleOwnerDocument();
    const rewrite = (
      methods: Array<string>,
      builder: typeof injector | typeof injectorRemoveChild,
    ) => {
      for (const name of methods) {
        const fn = window.Element.prototype[name];
        if (typeof fn !== 'function' || fn[__domWrapper__]) {
          continue;
        }
        rawElementMethods[name] = fn;
        const wrapper = builder(fn, name);
        wrapper[__domWrapper__] = true;
        window.Element.prototype[name] = wrapper;
      }
    };
    rewrite(mountElementMethods, injector);
    rewrite(removeChildElementMethods, injectorRemoveChild);
  }

  injectHandlerParams();
}

export function recordStyledComponentCSSRules(
  dynamicStyleSheetElementSet: Set<HTMLStyleElement>,
  styledComponentCSSRulesMap: WeakMap<HTMLStyleElement, CSSRuleList>,
) {
  dynamicStyleSheetElementSet.forEach((styleElement) => {
    if (isStyledComponentsLike(styleElement) && styleElement.sheet) {
      styledComponentCSSRulesMap.set(styleElement, styleElement.sheet.cssRules);
    }
  });
}

export function rebuildCSSRules(
  dynamicStyleSheetElementSet: Set<HTMLStyleElement>,
  styledComponentCSSRulesMap: WeakMap<HTMLStyleElement, CSSRuleList>,
) {
  dynamicStyleSheetElementSet.forEach((styleElement) => {
    const cssRules = styledComponentCSSRulesMap.get(styleElement);
    if (cssRules && (isStyledComponentsLike(styleElement) || cssRules.length)) {
      for (let i = 0; i < cssRules.length; i++) {
        const cssRule = cssRules[i];
        // re-insert rules for styled-components element
        styleElement.sheet?.insertRule(
          cssRule.cssText,
          styleElement.sheet?.cssRules.length,
        );
      }
    }
  });
}
