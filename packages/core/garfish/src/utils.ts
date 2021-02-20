import { assert, createKey, rawWindow, rawDocument } from '@garfish/utils';
import { Options } from './config';
import { dispatchEvents } from './dispatchEvents';

export const __GARFISH_FLAG__ = Symbol.for('__GARFISH_FLAG__');

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

export function createAppContainer(name: string, strictIsolation: boolean) {
  // 创建临时节点，该节点由 module 自行销毁
  const appContainer = document.createElement('div');
  const htmlNode = document.createElement(strictIsolation ? 'html' : 'div');

  appContainer.id = `garfish_app_for_${name || 'unknow'}_${createKey()}`;

  if (strictIsolation) {
    const root = appContainer.attachShadow({ mode: 'open' });
    root.appendChild(htmlNode);
    asyncNodeAttribute(htmlNode, rawDocument.body);
    dispatchEvents(root);
  } else {
    htmlNode.setAttribute('__GarfishMockHtml__', '');
    appContainer.appendChild(htmlNode);
  }

  return {
    htmlNode,
    appContainer,
  };
}

// 将不规范的语法转换为合规的语法
// 1M 的文本大约耗时：chrome 30ms, safari: 25ms, firefox: 25ms
export function transformCode(code: string) {
  const transformNode = document.createElement('html');
  transformNode.innerHTML = code;
  return transformNode.innerHTML;
}
