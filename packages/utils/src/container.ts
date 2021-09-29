import { interfaces } from '@garfish/core';
import { dispatchEvents } from './dispatchEvents';
import { __MockHtml__ } from './garfish';
import { assert, createKey } from './utils';

// Guarantee in strict isolation mode, the shadow in the dom popup window, floating layer depends on the body style of work
function asyncNodeAttribute(from: Element, to: Element) {
  const MutationObserver = window.MutationObserver;
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

export function createAppContainer(appInfo: interfaces.AppInfo) {
  const name = appInfo.name;
  // Create a temporary node, which is destroyed by the module itself
  const htmlNode = document.createElement('div');
  const appContainer = document.createElement('div');

  if (appInfo.sandbox && appInfo.sandbox.strictIsolation) {
    const root = appContainer.attachShadow({ mode: 'open' });
    root.appendChild(htmlNode);
    asyncNodeAttribute(htmlNode, document.body);
    dispatchEvents(root);
  } else {
    htmlNode.setAttribute(__MockHtml__, '');
    appContainer.id = `garfish_app_for_${name}_${createKey()}`;
    appContainer.appendChild(htmlNode);
  }

  return {
    htmlNode,
    appContainer,
  };
}

export async function getRenderNode(domGetter: interfaces.DomGetter) {
  assert(domGetter, `Invalid domGetter:\n ${domGetter}.`);
  let appWrapperNode = domGetter;

  if (typeof domGetter === 'string') {
    appWrapperNode = document.querySelector(domGetter);
  } else if (typeof domGetter === 'function') {
    appWrapperNode = await (domGetter as () => Element)();
  } else if (typeof domGetter === 'object') {
    appWrapperNode = domGetter;
  }

  assert(appWrapperNode, `Invalid domGetter: ${domGetter}`);
  return appWrapperNode as Element;
}
