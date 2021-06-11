import { makeMap } from '@garfish/utils';

export interface Text {
  content: string;
  type: 'text' | 'comment';
}

export interface Node {
  key?: string;
  type: 'element';
  tagName: string;
  children: Array<Node | Text>;
  attributes: Array<Record<string, string | null>>;
}

const xChar = 120; // x
const colonChar = 58; // :
const ns = 'http://www.w3.org/2000/svg';
const xlinkNS = 'http://www.w3.org/1999/xlink'; // xmlns:xlink
const xmlNS = 'http://www.w3.org/XML/1998/namespace'; // xmlns

// https://developer.mozilla.org/en-US/docs/Web/SVG/Element
export const SVG_TAGS =
  'svg,animate,animateMotion,animateTransform,circle,clipPath,color-profile,' +
  'defs,desc,discard,ellipse,feBlend,feColorMatrix,feComponentTransfer,' +
  'feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,' +
  'feDistanceLight,feDropShadow,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,' +
  'feGaussianBlur,feImage,feMerge,feMergeNode,feMorphology,feOffset,' +
  'fePointLight,feSpecularLighting,feSpotLight,feTile,feTurbulence,filter,' +
  'foreignObject,g,hatch,hatchpath,image,line,linearGradient,marker,mask,' +
  'mesh,meshgradient,meshpatch,meshrow,metadata,mpath,path,pattern,' +
  'polygon,polyline,radialGradient,rect,set,solidcolor,stop,switch,symbol,' +
  'text,textPath,title,tspan,unknown,use,view';

export const isSVG = makeMap(SVG_TAGS.split(','));

function attributesString(attributes: Node['attributes']) {
  if (!attributes || attributes.length === 0) return '';
  return attributes.reduce((total, { key, value }) => {
    return total + (value ? `${key}="${value}" ` : key);
  }, '');
}

export function applyAttributes(
  el: Element,
  attributes: Array<Record<string, string | null>>,
) {
  if (!attributes || attributes.length === 0) return;
  for (const { key, value } of attributes) {
    if (value === null) {
      el.setAttribute(key, '');
    } else if (typeof value === 'string') {
      if (key.charCodeAt(0) !== xChar) {
        el.setAttribute(key, value);
      } else if (key.charCodeAt(3) === colonChar) {
        el.setAttributeNS(xmlNS, key, value);
      } else if (key.charCodeAt(5) === colonChar) {
        el.setAttributeNS(xlinkNS, key, value);
      } else {
        el.setAttribute(key, value);
      }
    }
  }
}

export function isText(node: Node | Text) {
  return node && node.type === 'text';
}

export function isNode(node: Node | Text) {
  return node && node.type === 'element';
}

export function isCommentNode(node: Node | Text) {
  return node && node.type === 'comment';
}

export function isCssLinkNode(node: Node) {
  if (!isNode(node) || node.tagName !== 'link') return false;
  return node.attributes.find(({ key, value }) => {
    return key === 'rel' && value === 'stylesheet';
  });
}

export function isPrefetchJsLink(node: Node) {
  if (isNode(node) && node.tagName === 'link') {
    let hasRelAttr, hasAsAttr;
    for (const { key, value } of node.attributes) {
      if (key === 'rel') {
        hasRelAttr = true;
        if (value !== 'preload' && value !== 'prefetch') {
          return false;
        }
      } else if (key === 'as') {
        hasAsAttr = true;
        if (value !== 'script') return false;
      }
    }
    return Boolean(hasRelAttr && hasAsAttr);
  }
  return false;
}

export function removeElement(el: Element) {
  const parentNode = el && el.parentNode;
  if (parentNode) {
    parentNode.removeChild(el);
  }
}

export function createElement(node: Node) {
  const { tagName, attributes } = node;
  const el = isSVG(tagName)
    ? document.createElementNS(ns, tagName)
    : document.createElement(tagName);

  applyAttributes(el, attributes);
  return el;
}

export function createTextNode(node: Text) {
  return document.createTextNode(node.content);
}

export function createStyleNode(content: string) {
  const el = document.createElement('style');
  content && (el.textContent = content);
  applyAttributes(el, [{ key: 'type', value: 'text/css' }]);
  return el;
}

export function createLinkCommentNode(node: Node) {
  const ps = attributesString(node.attributes);
  return `<link ${ps.slice(0, -1)}></link>`;
}

export function createScriptCommentNode(node: Node) {
  const { attributes, children } = node;
  const ps = attributesString(attributes);
  const code = children?.[0] ? (children[0] as Text).content : '';
  return document.createComment(
    `<script ${ps} execute by garfish>${code}</script>`,
  );
}
