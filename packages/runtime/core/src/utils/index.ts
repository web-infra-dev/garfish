import {
  assert,
  createElement,
  createKey,
  createLinkNode,
  createScriptNode,
  createStyleNode,
  findProp,
  isCssLink,
  isJs,
  isPrefetchJsLink,
  parseContentType,
  rawDocument,
  rawWindow,
  toResolveUrl,
  transformCssUrl,
  VText,
  warn,
} from '@garfish/utils';
import { Options } from '../type';

// 将不规范的语法转换为合规的语法
// 1M 的文本大约耗时：chrome 30ms, safari: 25ms, firefox: 25ms
export function transformCode(code: string) {
  const transformNode = document.createElement('html');
  transformNode.innerHTML = code;
  return transformNode.innerHTML;
}


// 保证在严格隔离模式下，shadow dom 中的弹窗、浮层等依赖 body 的样式工作正常
function asyncNodeAttribute(from: Element, to: Element) {
  const MutationObserver = rawWindow.MutationObserver;
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(({ type, target, attributeName }) => {
      if (target) {
        const tag = target.nodeName?.toLowerCase();
        if (
          type === 'attributes' &&
          attributeName === 'style' &&
          (target === from || tag === 'body')
        ) {
          const style = (target as any)?.getAttribute('style');
          if (style) {
            to.setAttribute('style', style);
          }
        }
      }
    });
  });
  observer.observe(from, { attributes: true, subtree: true });
}

export function createAppContainer(name: string) {
  // 创建临时节点，该节点由 module 自行销毁
  const appContainer = document.createElement('div');
  const htmlNode = document.createElement('div');

  appContainer.id = `garfish_app_for_${name || 'unknow'}_${createKey()}`;
  htmlNode.setAttribute('__GarfishMockHtml__', '');
  appContainer.appendChild(htmlNode);

  return {
    htmlNode,
    appContainer,
  };
}

export function getRenderNode(domGetter: Options['domGetter']) {
  assert(domGetter, `Invalid domGetter:\n ${domGetter}`);

  // prettier-ignore
  const tnode =
    typeof domGetter === 'string'
      ? document.querySelector(domGetter)
      : typeof domGetter === 'function'
        ? domGetter()
        : domGetter;

  assert(tnode, `Invalid domGetter: ${domGetter}`);
  return tnode;
}

export function renderContainer(
  entryResManager: any,
  baseUrl: string,
  container: HTMLElement,
  strictIsolation: boolean,
) {
  entryResManager.renderElements(
    {
      meta: () => null,

      a: (vnode) => {
        toResolveUrl(vnode, 'href', baseUrl);
        return createElement(vnode);
      },

      img: (vnode) => {
        toResolveUrl(vnode, 'src', baseUrl);
        return createElement(vnode);
      },

      // body 和 head 这样处理是为了兼容旧版本
      body: (vnode) => {
        if (!strictIsolation) {
          vnode.tagName = 'div';
          vnode.attributes.push({
            key: '__GarfishMockBody__',
            value: null,
          });
          return createElement(vnode);
        } else {
          return createElement(vnode);
        }
      },

      head: (vnode) => {
        if (!strictIsolation) {
          vnode.tagName = 'div';
          vnode.attributes.push({
            key: '__GarfishMockHead__',
            value: null,
          });
          return createElement(vnode);
        } else {
          return createElement(vnode);
        }
      },

      script: (vnode) => {
        const type = findProp(vnode, 'type');
        const mimeType = type?.value;
        if (mimeType) {
          if (mimeType === 'module') return null;
          if (!isJs(parseContentType(mimeType))) {
            return createElement(vnode);
          }
        }

        const resource = this.resources.js.find((manager) => {
          if (!(manager as any).async) {
            if (vnode.key) {
              return vnode.key === (manager as any).key;
            }
          }
          return false;
        });

        if (resource) {
          const { code, url } = (resource as any).opts;
          this.execScript(code, {}, url, {
            async: false,
            noEntry: !!findProp(vnode, 'no-entry'),
          });
        } else if (__DEV__) {
          const async = findProp(vnode, 'async');
          if (!async) {
            const nodeStr = JSON.stringify(vnode, null, 2);
            warn(`The current js node cannot be found.\n\n ${nodeStr}`);
          }
        }
        return createScriptNode(vnode);
      },

      style: (vnode) => {
        const text = vnode.children[0] as VText;
        if (text) {
          text.content = transformCssUrl(baseUrl, text.content);
        }
        return createElement(vnode);
      },

      link: (vnode) => {
        if (isCssLink(vnode)) {
          const href = findProp(vnode, 'href');
          const resource = this.resources.link.find(
            ({ opts }) => opts.url === href?.value,
          );
          if (!resource) {
            return createElement(vnode);
          }

          const { url, code } = resource.opts;
          const content = __DEV__
            ? `\n/*${createLinkNode(vnode)}*/\n${code}`
            : code;

          if (resource.type !== 'css') {
            warn(`The current resource type does not match. "${url}"`);
            return null;
          }
          return createStyleNode(content);
        }
        return isPrefetchJsLink(vnode)
          ? createScriptNode(vnode)
          : createElement(vnode);
      },
    },
    container,
  );
}
