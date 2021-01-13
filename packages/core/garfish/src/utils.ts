/* eslint-disable indent */
import { parse } from 'himalaya';
import { assert, createKey } from '@garfish/utils';
import { Options } from './config';

export const __GARFISH_FLAG__ = Symbol.for('__GARFISH_FLAG__');

export function getRenderNode(domGetter: Options['domGetter']) {
  assert(domGetter, `Invalid domGetter:\n ${domGetter}`);

  const tNode =
    typeof domGetter === 'string'
      ? document.querySelector(domGetter)
      : typeof domGetter === 'function'
      ? domGetter()
      : domGetter;

  assert(tNode, `Invalid domGetter: ${domGetter}`);
  return tNode;
}

export function createAppContainer(name: string = 'unknown') {
  // 创建临时节点，该节点由 module 自行销毁
  const container = document.createElement('div');
  container.id = `garfish_app_for_${name}_${createKey()}`;
  return container;
}

export const transformCode = (code: string) => {
  const transformDiv = document.createElement('div');
  transformDiv.innerHTML = code;
  return parse(transformDiv.innerHTML);
};
