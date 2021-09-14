import { interfaces } from '@garfish/core';
import { __MockHtml__ } from './garfish';
import { assert, createKey } from './utils';

export function createAppContainer(name: string) {
  // Create a temporary node, which is destroyed by the module itself
  const htmlNode = document.createElement('div');
  const appContainer = document.createElement('div');

  htmlNode.setAttribute(__MockHtml__, '');
  appContainer.id = `garfish_app_for_${name}_${createKey()}`;
  appContainer.appendChild(htmlNode);

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
    appWrapperNode = await domGetter();
  } else if (typeof domGetter === 'object') {
    appWrapperNode = domGetter;
  }

  assert(appWrapperNode, `Invalid domGetter: ${domGetter}`);
  return appWrapperNode as Element;
}
