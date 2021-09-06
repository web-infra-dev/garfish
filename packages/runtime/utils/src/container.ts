import { interfaces } from '@garfish/core';
import { assert, createKey } from './utils';

export function createAppContainer(name: string) {
  // Create a temporary node, which is destroyed by the module itself
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

export async function getRenderNode(
  domGetter: interfaces.DomGetter,
): Promise<Element> {
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
