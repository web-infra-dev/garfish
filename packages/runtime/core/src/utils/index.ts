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
import { interfaces } from '../interface';

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

export function getRenderNode(domGetter: interfaces.DomGetter): Element {
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
