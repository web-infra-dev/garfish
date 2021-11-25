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

export const appContainerId = 'garfish_app_for';

export function createAppContainer(appInfo: interfaces.AppInfo) {
  const name = appInfo.name;
  // Create a temporary node, which is destroyed by the module itself
  let htmlNode: HTMLDivElement | HTMLHtmlElement =
    document.createElement('div');
  const appContainer = document.createElement('div');

  if (appInfo.sandbox && appInfo.sandbox.strictIsolation) {
    htmlNode = document.createElement('html');
    const root = appContainer.attachShadow({ mode: 'open' });
    root.appendChild(htmlNode);
    // asyncNodeAttribute(htmlNode, document.body);
    dispatchEvents(root);
  } else {
    htmlNode.setAttribute(__MockHtml__, '');
    appContainer.appendChild(htmlNode);
  }
  appContainer.id = `${appContainerId}_${name}_${createKey()}`;

  return {
    htmlNode,
    appContainer,
  };
}

/**
 *  Wait for the specified dom ready tool method
 */
function waitElementReady(selector, callback) {
  const elem = document.querySelector(selector);

  if (elem !== null) {
    callback(elem);
    return;
  }

  setTimeout(function () {
    waitElementReady(selector, callback);
  }, 200);
}

function delay(duration) {
  return new Promise(function (resolve) {
    setTimeout(resolve, duration);
  });
}

function waitElement(selector, timeout = 3000) {
  const waitPromise = new Promise(function (resolve) {
    waitElementReady(selector, function (elem: Element) {
      return resolve(elem);
    });
  });
  return Promise.race([delay(timeout), waitPromise]);
}

export async function getRenderNode(domGetter: interfaces.DomGetter) {
  assert(domGetter, `Invalid domGetter:\n ${domGetter}.`);
  let appWrapperNode;

  if (typeof domGetter === 'string') {
    appWrapperNode = (await waitElement(domGetter)) as
      | Element
      | null
      | undefined;
  } else if (typeof domGetter === 'function') {
    appWrapperNode = await Promise.resolve(domGetter());
  } else if (domGetter instanceof Element) {
    appWrapperNode = domGetter;
  }

  console.log(
    '来这里了!!!!!!!!',
    appWrapperNode instanceof Element,
    domGetter,
    appWrapperNode,
  );

  assert(appWrapperNode instanceof Element, `Invalid domGetter: ${domGetter}`);
  return appWrapperNode as Element;
}
