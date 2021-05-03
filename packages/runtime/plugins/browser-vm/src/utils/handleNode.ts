import {
  def,
  warn,
  isJs,
  isCss,
  makeMap,
  rawObject,
  rawDocument,
  rawObserver,
  findTarget,
  transformCssUrl,
  createStyleNode,
  parseContentType,
} from '@garfish/utils';
import { Sandbox } from '../sandbox';
import { handlerParams } from './index';
import { __domWrapper__ } from '../symbolTypes';
import { rootElm, toResolveUrl } from './sandbox';

const rawElementMethods = Object.create(null);
const isResourceNode = makeMap(['a', 'img', 'link', 'script']);
const isInsertMethod = makeMap(['insertBefore', 'insertAdjacentElement']);

const mountElementMethods = [
  'append',
  'appendChild',
  'insertBefore',
  'insertAdjacentElement',
];

// 创建 js 注释节点
function createScriptComment(src: string, code: string) {
  src = src ? `src="${src}" ` : '';
  return rawDocument.createComment(
    `<script ${src}execute by garfish(dynamic)>${code}</script>`,
  );
}

function createLinkComment(href: string) {
  href = href ? `href="${href}" ` : '';
  return rawDocument.createComment(
    `<link ${href}execute by garfish(dynamic)></link>`,
  );
}

function dispatchEvent(el: Element, type: string) {
  // 放到下个宏任务中，以保证当前的同步脚本执行完
  setTimeout(() => {
    const event: Event & { garfish?: boolean } = new Event(type);
    event.garfish = true;
    rawObject.defineProperty(event, 'target', { value: el });
    el.dispatchEvent(event);
  });
}

function filterRequestConfig(
  url: string,
  config: Sandbox['options']['requestConfig'],
): RequestInit {
  if (typeof config === 'function') {
    config = config(url);
  }
  return { mode: 'cors', ...config };
}

function processResponse(res: Response) {
  if (res.status >= 400) {
    throw new Error(`"${res.url}" load failed with status "${res.status}"`);
  }
  return res.text();
}

function addDynamicLink(
  el: HTMLLinkElement,
  config: Sandbox['options']['requestConfig'],
  callback: (code: string) => void,
) {
  const { href, type } = el;

  if (!type || isCss(parseContentType(type))) {
    if (href) {
      const requestConfig = filterRequestConfig(href, config);

      fetch(href, requestConfig)
        .then(processResponse)
        .then((code) => {
          dispatchEvent(el, 'load');
          callback(code);
          return;
        })
        .catch((e) => {
          __DEV__ && warn(e);
          dispatchEvent(el, 'error');
        });
    }
  } else if (__DEV__) {
    warn(`Invalid resource type "${type}", "${href}"`);
  }
  return createLinkComment(href);
}

// 动态添加的 script 标签
function addDynamicScript(
  sandbox: Sandbox,
  config: Sandbox['options']['requestConfig'],
  el: HTMLScriptElement,
) {
  const { src, type } = el;
  const code = el.textContent || el.text || '';

  if (!type || isJs(parseContentType(type))) {
    const namespace = sandbox.options.namespace || '';

    // src 优先级更高
    if (src) {
      const requestConfig = filterRequestConfig(src, config);

      fetch(src, requestConfig)
        .then(processResponse)
        .then((code) => {
          dispatchEvent(el, 'load');
          return code;
        })
        .catch((e) => {
          __DEV__ && warn(e);
          dispatchEvent(el, 'error');
        })
        .then((code) => {
          if (code) {
            sandbox.execScript(code, src, { noEntry: true });
          }
        });
    } else if (code) {
      sandbox.execScript(code, `${namespace}_dynamic_script`, {
        noEntry: true,
      });
    }
  } else if (__DEV__) {
    // 现在还不支持 esm
    warn(
      type === 'module'
        ? `Does not support "esm" module script. "${src}"`
        : `Invalid resource type "${type}", "${src}"`,
    );
  }
  return createScriptComment(src, code);
}

const makeElInjector = (current: Function, method: string) => {
  return function () {
    const el = method === 'insertAdjacentElement' ? arguments[1] : arguments[0];

    // 过滤 css 中的相对路径
    if (this?.tagName?.toLowerCase() === 'style') {
      const baseUrl = el.GARFISH_SANDBOX?.options.baseUrl;
      if (baseUrl) {
        this.textContent = transformCssUrl(baseUrl, el.textContent);
        return current.apply(this, arguments);
      }
    }

    if (el) {
      const sandbox = el.GARFISH_SANDBOX as Sandbox;

      if (sandbox) {
        let newNode;
        const rootEl = rootElm(sandbox);
        const append = rawElementMethods['appendChild'];
        const tag = el.tagName && el.tagName.toLowerCase();
        const { baseUrl, requestConfig } = sandbox.options;

        // 转换为绝对路径
        if (isResourceNode(tag)) {
          const src = el.getAttribute('src');
          const href = el.getAttribute('href');
          if (src) {
            el.src = toResolveUrl(sandbox, src);
          } else if (href) {
            el.href = toResolveUrl(sandbox, href);
          }
        }

        if (tag === 'style') {
          newNode = el;
          if (baseUrl)
            newNode.textContent = transformCssUrl(baseUrl, el.textContent);
        } else if (tag === 'script') {
          newNode = addDynamicScript(sandbox, requestConfig, el);
        } else if (tag === 'link') {
          if (el.rel === 'stylesheet' && el.href) {
            newNode = addDynamicLink(el, requestConfig, (code) => {
              // link 标签转为 style 标签，修正 url
              code = transformCssUrl(el.href, code);
              append.call(rootEl, createStyleNode(code));
            });
          } else {
            newNode = el;
          }
        } else if (__DEV__) {
          // 沙箱内部创建的 iframe 标签上的 window 都用当前沙箱的代理 window
          if (tag === 'iframe' && typeof el.onload === 'function') {
            def(el, 'contentWindow', sandbox.context);
            def(el, 'contentDocument', sandbox.context.document);
          }
        }

        sandbox.callHook('onAppendNode', [sandbox, rootEl, newNode, tag]);

        if (newNode) {
          // 如果是 insertBefore、insertAdjacentElement 方法
          // 添加到容器内时不需要进行再次改写
          if (
            isInsertMethod(method) &&
            rootEl.contains(this) &&
            arguments[1]?.parentNode === this
          ) {
            return current.apply(this, arguments);
          }

          if (tag === 'style' || tag === 'link') {
            return append.call(
              findTarget(rootEl, ['head', 'div[__GarfishMockHead__]']),
              newNode,
            );
          }

          if (tag === 'script') {
            return append.call(
              findTarget(rootEl, ['body', 'div[__GarfishMockBody__]']),
              newNode,
            );
          }
          return append.call(rootEl, newNode);
        }
      }
    }
    return current.apply(this, arguments);
  };
};

// 初始化
if (typeof window.Element === 'function') {
  for (const method of mountElementMethods) {
    const nativeMethod = window.Element.prototype[method];
    if (typeof nativeMethod !== 'function' || nativeMethod[__domWrapper__]) {
      continue;
    }

    rawElementMethods[method] = nativeMethod;
    const wrapper = makeElInjector(nativeMethod, method);
    wrapper[__domWrapper__] = true;
    window.Element.prototype[method] = wrapper;
  }
}

MutationObserver.prototype.observe = function () {
  return rawObserver.apply(this, handlerParams(arguments));
};
