import { interfaces } from '@garfish/core';
import { assert, createKey } from './utils';

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
