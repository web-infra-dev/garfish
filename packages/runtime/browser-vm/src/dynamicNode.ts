import { StyleManager, JavaScriptManager } from '@garfish/loader';
import {
  def,
  warn,
  isJs,
  isCss,
  makeMap,
  DOMApis,
  findTarget,
  transformUrl,
  sourceListTags,
  parseContentType,
} from '@garfish/utils';
import { Sandbox } from './sandbox';
import { __domWrapper__ } from './symbolTypes';
import { rootElm, sandboxMap, handlerParams } from './utils';

const rawElementMethods = Object.create(null);
const isInsertMethod = makeMap(['insertBefore', 'insertAdjacentElement']);

const mountElementMethods = [
  'append',
  'appendChild',
  'insertBefore',
  'insertAdjacentElement',
];

const fixResourceNodeUrl = (el: any, baseUrl: string) => {
  const src = el.getAttribute('src');
  const href = el.getAttribute('href');
  src && (el.src = transformUrl(baseUrl, src));
  href && (el.href = transformUrl(baseUrl, href));
};

const dispatchEvent = (el: Element, type: string) => {
  // Put it in the next macro task to ensure that the current synchronization script is executed
  setTimeout(() => {
    const event: Event & { garfish?: boolean } = new Event(type);
    event.garfish = true;
    Object.defineProperty(event, 'target', { value: el });
    el.dispatchEvent(event);
  });
};

const addDynamicLinkNode = (
  sandbox: Sandbox,
  el: HTMLLinkElement,
  callback: (styleNode: HTMLStyleElement) => void,
) => {
  const { href, type } = el;

  if (!type || isCss(parseContentType(type))) {
    if (href) {
      const namespace = sandbox.options.namespace || '';
      sandbox.loader
        .load<StyleManager>(namespace, href)
        .then(({ resourceManager: styleManager }) => {
          dispatchEvent(el, 'load');
          styleManager.correctPath();
          callback(styleManager.renderAsStyleElement());
          return;
        })
        .catch((e) => {
          __DEV__ && warn(e);
          dispatchEvent(el, 'error');
        });
    }
  } else {
    if (__DEV__) {
      warn(`Invalid resource type "${type}", "${href}"`);
    }
  }
  return DOMApis.createLinkCommentNode(href);
};

const addDynamicScriptNode = (sandbox: Sandbox, el: HTMLScriptElement) => {
  const { src, type } = el;
  const code = el.textContent || el.text || '';

  if (!type || isJs(parseContentType(type))) {
    // The "src" higher priority
    if (src) {
      const namespace = sandbox.options.namespace || '';

      sandbox.loader
        .load<JavaScriptManager>(namespace, src)
        .then(({ resourceManager: { url, scriptCode } }) => {
          dispatchEvent(el, 'load');
          sandbox.execScript(scriptCode, {}, url, { noEntry: true });
        })
        .catch((e) => {
          __DEV__ && warn(e);
          dispatchEvent(el, 'error');
        });
    } else if (code) {
      sandbox.execScript(code, {}, '', { noEntry: true });
    }
  } else {
    if (__DEV__) {
      warn(
        type === 'module'
          ? `Does not support "esm" module script in sandbox. "${src}"`
          : `Invalid resource type "${type}", "${src}"`,
      );
    }
  }
  return DOMApis.createScriptCommentNode({ src, code });
};

const injector = (current: Function, methodName: string) => {
  return function () {
    // prettier-ignore
    const el = methodName === 'insertAdjacentElement'
      ? arguments[1]
      : arguments[0];
    const sandbox = el && sandboxMap.get(el);

    if (this?.tagName?.toLowerCase() === 'style') {
      const sandbox = sandboxMap.get(el);
      const baseUrl = sandbox && sandbox.options.baseUrl;
      if (baseUrl) {
        const manager = new StyleManager(el.textContent);
        manager.correctPath(baseUrl);
        this.textContent = manager.styleCode;
        return current.apply(this, arguments);
      }
    }

    if (sandbox) {
      let convertedNode;
      let rootNode = rootElm(sandbox) || document;
      const baseRootNode = rootNode;
      const { baseUrl } = sandbox.options;
      const append = rawElementMethods['appendChild'];
      const tag = el.tagName && el.tagName.toLowerCase();

      // Deal with some static resource nodes
      if (baseUrl && sourceListTags.includes(tag)) {
        fixResourceNodeUrl(el, baseUrl);
      }

      // Add dynamic script node by loader
      if (tag === 'script') {
        rootNode = findTarget(rootNode, ['body', 'div[__GarfishMockBody__]']);
        convertedNode = addDynamicScriptNode(sandbox, el);
      }

      // The style node needs to be placed in the sandbox root container
      if (tag === 'style') {
        rootNode = findTarget(rootNode, ['head', 'div[__GarfishMockHead__]']);
        if (baseUrl) {
          const manager = new StyleManager(el.textContent);
          manager.correctPath(baseUrl);
          el.textContent = manager.styleCode;
        }
        convertedNode = el;
      }

      // The link node of the request css needs to be changed to style node
      if (tag === 'link') {
        rootNode = findTarget(rootNode, ['head', 'div[__GarfishMockHead__]']);
        if (el.rel === 'stylesheet' && el.href) {
          convertedNode = addDynamicLinkNode(sandbox, el, (styleNode) =>
            append.call(rootNode, styleNode),
          );
        } else {
          convertedNode = el;
        }
      }

      if (__DEV__) {
        // The "window" on the iframe tags created inside the sandbox all use the "proxy window" of the current sandbox
        if (tag === 'iframe' && typeof el.onload === 'function') {
          def(el, 'contentWindow', sandbox.global);
          def(el, 'contentDocument', sandbox.global.document);
        }
      }

      if (convertedNode) {
        // If it is "insertBefore" or "insertAdjacentElement" method,
        // No need to rewrite when added to the container
        if (
          isInsertMethod(methodName) &&
          baseRootNode.contains(this) &&
          arguments[1]?.parentNode === this
        ) {
          return current.apply(this, arguments);
        }
        return append.call(rootNode, convertedNode);
      }
    }
    return current.apply(this, arguments);
  };
};

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
