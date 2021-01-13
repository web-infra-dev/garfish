import {
  def,
  warn,
  isJs,
  isCss,
  makeMap,
  rawObject,
  rawDocument,
  rawObserver,
  transformCssUrl,
  createStyleNode,
  parseContentType,
} from '@garfish/utils';
import { Sandbox } from '../context';
import { rootElm, toResolveUrl } from '../utils/sandbox';
import { handlerParams } from './index';

const wrapperFlag = Symbol.for('GarfishWrapperFunction');

const isResourceNode = makeMap(['a', 'img', 'link', 'script']);

const mountElementMethods = [
  'append',
  'appendChild',
  'insertBefore',
  'insertAdjacentElement',
];

const rawElementMethods = {};

// 创建 js 注释节点
function createScriptComment(src: string, code: string) {
  src = src ? `src="${src}" ` : '';
  return rawDocument.createComment(
    `<script ${src}Garfish dynamic>${code}</script>`,
  );
}

function createLinkComment(href: string) {
  href = href ? `href="${href}" ` : '';
  return rawDocument.createComment(`<link ${href}Garfish dynamic></link>`);
}

function dispatchEvent(el: Element, type: string) {
  const event = new Event(type);
  // @ts-ignore
  event.garfish = true;
  rawObject.defineProperty(event, 'target', { value: el });
  el.dispatchEvent(event);
}

function processResponse(res: Response) {
  if (res.status >= 400) {
    throw new Error(`"${res.url}" load failed with status "${res.status}"`);
  }
  return res.text();
}

function addSynamicLink(el: HTMLLinkElement, callback: (code: string) => void) {
  const { href, type } = el;

  if (!type || isCss(parseContentType(type))) {
    if (href) {
      fetch(href)
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
function addDynamicScript(sandbox: Sandbox, el: HTMLScriptElement) {
  const { src, type } = el;
  const code = el.textContent || el.text || '';

  if (!type || isJs(parseContentType(type))) {
    const namespace = sandbox.options.namespace || '';
    // src 优先级更高
    if (src) {
      fetch(src)
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
            sandbox.execScript(code, src);
          }
        });
    } else if (code) {
      sandbox.execScript(code, `${namespace}_dynamic_script`);
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

const makeElInjector = (cur: Function, method: string) => {
  return function () {
    const el = method === 'insertAdjacentElement' ? arguments[1] : arguments[0];

    // 过滤 css 中的相对路径
    if (this?.tagName?.toLowerCase() === 'style') {
      const baseUrl = this.GARFISH_SANDBOX?.options.baseUrl;
      if (baseUrl) {
        el.textContent = transformCssUrl(baseUrl, el.textContent);
        return cur.apply(this, arguments);
      }
    }

    if (el) {
      const sandbox = el.GARFISH_SANDBOX as Sandbox;

      if (sandbox) {
        let newNode;
        const rootEl = rootElm(sandbox);
        const append = rawElementMethods['appendChild'];
        const tag = el.tagName && el.tagName.toLowerCase();

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
        } else if (tag === 'script') {
          newNode = addDynamicScript(sandbox, el);
        } else if (tag === 'link') {
          if (el.rel === 'stylesheet') {
            newNode = addSynamicLink(el, (code) => {
              // link 标签转为 style 标签，修正 url
              code = transformCssUrl(el.href, code);
              append.call(rootEl, createStyleNode(code));
            });
          } else {
            newNode = el;
          }
        } else if (__DEV__) {
          // 沙箱内部创建的 iframe, window 都用当前沙箱的代理 window
          // 处理 react-hot-loader 利用 iframe 热更新的问题
          if (tag === 'iframe' && typeof el.onload === 'function') {
            def(el, 'contentWindow', sandbox.context);
            def(el, 'contentDocument', sandbox.context.document);
          }
        }

        sandbox.callHook('onAppendNode', [sandbox, rootEl, newNode, tag]);
        if (newNode) {
          // 为insertBefore、insertAdjacentElement方法时，添加到容器内，不需要进行再次改写
          if (
            (method === 'insertBefore' || method === 'insertAdjacentElement') &&
            rootEl.contains(this)
          ) {
            return cur.apply(this, arguments);
          }
          return append.call(rootEl, newNode);
        }
      }
    }
    return cur.apply(this, arguments);
  };
};

// 初始化
if (typeof window.Element === 'function') {
  for (const method of mountElementMethods) {
    const cur = window.Element.prototype[method];
    if (!cur[wrapperFlag]) {
      rawElementMethods[method] = cur;
      const wrapper = makeElInjector(cur, method);
      wrapper[wrapperFlag] = true;
      window.Element.prototype[method] = wrapper;
    }
  }
}

MutationObserver.prototype.observe = function () {
  return rawObserver.apply(this, handlerParams(arguments));
};
