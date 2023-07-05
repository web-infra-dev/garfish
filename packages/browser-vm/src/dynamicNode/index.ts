import { makeMap, safeWrapper, warn } from '@garfish/utils';
import { __domWrapper__ } from '../symbolTypes';
import { injectHandlerParams } from './processParams';
import { DynamicNodeProcessor, rawElementMethods } from './processor';
import { isInIframe, sandboxMap, isStyledComponentsLike } from '../utils';
import { SandboxOptions, StyledComponentCSSRulesData } from '../types';

const mountElementMethods = [
  'append',
  'appendChild',
  'insertBefore',
  'insertAdjacentElement',
];
const removeChildElementMethods = ['removeChild'];

const ignoreElementTimingTags = makeMap([
  'STYLE',
  'SCRIPTS',
  'LINK',
  'META',
  'TITLE',
]);

function injector(current: Function, methodName: string) {
  return function (this: Element) {
    // prettier-ignore
    const el = methodName === 'insertAdjacentElement'
      ? arguments[1]
      : arguments[0];
    const sandbox = sandboxMap.get(el);
    const originProcess = () => current.apply(this, arguments);

    // custom performance Element Timing API
    // https://web.dev/custom-metrics/#element-timing-api
    safeWrapper(() => {
      if (ignoreElementTimingTags(el.tagName)) return;
      if (
        el?.setAttribute &&
        typeof el?.setAttribute === 'function' &&
        !el?.getAttribute('elementtiming') &&
        sandbox &&
        sandbox.options.disableElementtiming !== true
      ) {
        el?.setAttribute(
          'elementtiming',
          sandbox
            ? `${(sandbox as any).options.namespace}-element-timing`
            : 'element-timing',
        );
      }
    });

    if (sandbox) {
      if (el && this?.tagName?.toLowerCase() === 'style') {
        // We take it from the loader, avoid having multiple manager constructors
        const manager = new sandbox.loader.StyleManager(el.textContent);
        const { baseUrl, namespace, styleScopeId } = sandbox.options;
        manager.correctPath(baseUrl);
        manager.setScope({
          appName: namespace,
          rootElId: styleScopeId!(),
        });
        el.textContent = manager.transformCode(manager.styleCode);
        return originProcess();
      } else {
        const processor = new DynamicNodeProcessor(el, sandbox, methodName);
        return processor.append(this, arguments, originProcess);
      }
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
    }
    return originProcess();
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

export function makeElInjector(sandboxConfig: SandboxOptions) {
  if ((makeElInjector as any).hasInject) return;
  (makeElInjector as any).hasInject = true;

  if (typeof window.Element === 'function') {
    // iframe can read html container this can't point to proxyDocument has Illegal invocation error
    if (sandboxConfig.fixOwnerDocument)
      safeWrapper(() => handleOwnerDocument());
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

export function rebuildCSSRules(
  dynamicStyleSheetElementSet: Set<HTMLStyleElement>,
  styledComponentCSSRulesMap: WeakMap<
    HTMLStyleElement,
    StyledComponentCSSRulesData
  >,
) {
  dynamicStyleSheetElementSet.forEach((styleElement) => {
    const rules = styledComponentCSSRulesMap.get(styleElement);

    if (rules && (isStyledComponentsLike(styleElement) || rules.length)) {
      const realSheet = Reflect.get(
        HTMLStyleElement.prototype,
        'sheet',
        styleElement,
      );
      if (realSheet) {
        for (let i = 0; i < rules.length; i++) {
          const cssRule = rules[i];
          // re-insert rules for styled-components element
          // use realSheet to skip transforming
          realSheet.insertRule(cssRule, i);
        }
      }
    }
  });
}
