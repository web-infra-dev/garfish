import { makeMap } from './utils';
import { rawRemoveChild } from './raw';

export interface VText {
  type: 'text' | 'comment';
  content: string;
}

export interface VNode {
  type: 'element';
  tagName: string;
  children: Array<VNode | VText>;
  attributes: Array<Record<string, string | null>>;
}

// 匹配 css 中的 url
const MATH_CSS_URL = /url\(['"]?([^\)]+)['"]?\)/g;

const xChar = 120; // x
const colonChar = 58; // :
const ns = 'http://www.w3.org/2000/svg';
const xlinkNS = 'http://www.w3.org/1999/xlink';
const xmlNS = 'http://www.w3.org/XML/1998/namespace';

export const isSVG = makeMap(
  (
    'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
    'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
    'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view'
  ).split(','),
);

export function applyAttributes(
  el: Element,
  attributes: Array<Record<string, string | null>>,
) {
  for (const { key, value } of attributes) {
    if (value === null) {
      el.setAttribute(key, '');
    } else if (typeof value === 'string') {
      if (key.charCodeAt(0) !== xChar) {
        el.setAttribute(key, value);
      } else if (key.charCodeAt(3) === colonChar) {
        // 如果是 xml namespace
        el.setAttributeNS(xmlNS, key, value);
      } else if (key.charCodeAt(5) === colonChar) {
        // 如果是 xlink namespace， `xmlns:xlink`
        el.setAttributeNS(xlinkNS, key, value);
      } else {
        el.setAttribute(key, value);
      }
    }
  }
}

function attrsStr(attributes: VNode['attributes']) {
  return attributes.reduce((total, { key, value }) => {
    return total + (value ? `${key}="${value}" ` : key);
  }, '');
}

export function isVText(vnode: VNode | VText) {
  return vnode && vnode.type === 'text';
}

export function isVNode(vnode: VNode | VText) {
  return vnode && vnode.type === 'element';
}

export function isComment(vnode: VNode | VText) {
  return vnode && vnode.type === 'comment';
}

export function isCssLink(vnode: VNode) {
  if (!isVNode(vnode) || vnode.tagName !== 'link') return false;
  return vnode.attributes.find(({ key, value }) => {
    return key === 'rel' && value === 'stylesheet';
  });
}

export function isPrefetchJsLink(vnode: VNode) {
  if (!isVNode(vnode) || vnode.tagName !== 'link') return false;
  let hasRel, hasAs;
  for (const { key, value } of vnode.attributes) {
    if (key === 'rel') {
      hasRel = true;
      if (value !== 'preload' && value !== 'prefetch') {
        return false;
      }
    } else if (key === 'as') {
      hasAs = true;
      if (value !== 'script') return false;
    }
  }
  return (hasRel && hasAs) as boolean;
}

export function createElement(vnode: VNode) {
  const { tagName, attributes } = vnode;
  const el = isSVG(tagName)
    ? document.createElementNS(ns, tagName)
    : document.createElement(tagName);

  applyAttributes(el, attributes);
  return el;
}

export function createTextNode(vnode: VText) {
  return document.createTextNode(vnode.content);
}

export function createLinkNode(vnode: VNode) {
  const propsStr = attrsStr(vnode.attributes);
  return `<link ${propsStr.slice(0, -1)}></link>`;
}

export function transformUrl(resolvePath: string, curPath: string) {
  const baseUrl = new URL(resolvePath, location.href);
  const realPath = new URL(curPath, baseUrl.href);
  return realPath.href;
}

// 暂时还不能处理 `@import 'a.css';`
export function transformCssUrl(resolvePath: string, code: string) {
  if (!code) return '';
  // 相对路径根据 css 文件的路径转换为绝对路径
  return code.replace(MATH_CSS_URL, (k1, k2) => {
    return `url("${transformUrl(resolvePath, k2)}")`;
  });
}

export function createStyleNode(content: string) {
  const el = document.createElement('style');
  content && (el.textContent = content);
  applyAttributes(el, [{ key: 'type', value: 'text/css' }]);
  return el;
}

export function removeElement(el: Element) {
  const parentNode = el && el.parentNode;
  if (parentNode) {
    rawRemoveChild.call(parentNode, el);
  }
}

export function createScriptNode(vnode: VNode) {
  const { attributes, children } = vnode;
  const propsStr = attrsStr(attributes);
  const code = children[0] ? (children[0] as VText).content : '';
  return document.createComment(`<script ${propsStr} Garfish>${code}</script>`);
}
