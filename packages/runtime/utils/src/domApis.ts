import { makeMap } from './utils';

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

type Attributes = Array<Record<string, string | null>>;

const xChar = 120; // "x" char
const colonChar = 58; // ":" char
const ns = 'http://www.w3.org/2000/svg';
const xlinkNS = 'http://www.w3.org/1999/xlink'; // xmlns:xlink
const xmlNS = 'http://www.w3.org/XML/1998/namespace'; // xmlns

// https://developer.mozilla.org/en-US/docs/Web/SVG/Element
const SVG_TAGS =
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

const isSVG = makeMap(SVG_TAGS.split(','));

function attributesString(attributes: Node['attributes']) {
  if (!attributes || attributes.length === 0) return '';
  return attributes.reduce((total, { key, value }) => {
    return total + (value ? `${key}="${value}" ` : key);
  }, '');
}

export const DOMApis = {
  isText(node: Node | Text) {
    return node && node.type === 'text';
  },

  isNode(node: Node | Text) {
    return node && node.type === 'element';
  },

  isCommentNode(node: Node | Text) {
    return node && node.type === 'comment';
  },

  isCssLinkNode(node: Node) {
    if (this.isNode(node) && node.tagName === 'link') {
      return !!node.attributes.find(
        ({ key, value }) => key === 'rel' && value === 'stylesheet',
      );
    }
    return false;
  },

  isIconLinkNode(node: Node) {
    if (this.isNode(node) && node.tagName === 'link') {
      return !!node.attributes.find(
        ({ key, value }) => key === 'rel' && value === 'icon',
      );
    }
    return false;
  },

  isPrefetchJsLinkNode(node: Node) {
    if (!this.isNode(node) || node.tagName !== 'link') return false;
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
  },

  isRemoteComponent(node: Node) {
    if (!this.isNode(node) || node.tagName !== 'meta') return false;
    let hasNameAttr, hasSrcAttr;
    for (const { key, value } of node.attributes) {
      if (key === 'name') {
        hasNameAttr = true;
        if (value !== 'garfish-remote-component') {
          return false;
        }
      } else if (key === 'src') {
        hasSrcAttr = true;
        if (value === '') return false;
      }
    }
    return Boolean(hasNameAttr && hasSrcAttr);
  },

  removeElement(el: Element) {
    const parentNode = el && el.parentNode;
    if (parentNode) {
      parentNode.removeChild(el);
    }
  },

  createElement(node: Node) {
    const { tagName, attributes } = node;
    const el = isSVG(tagName)
      ? document.createElementNS(ns, tagName)
      : document.createElement(tagName);

    this.applyAttributes(el, attributes);
    return el;
  },

  createTextNode(node: Text) {
    return document.createTextNode(node.content);
  },

  createStyleNode(content: string) {
    const el = document.createElement('style');
    content && (el.textContent = content);
    this.applyAttributes(el, [{ key: 'type', value: 'text/css' }]);
    return el;
  },

  createLinkCommentNode(node: Node | string) {
    if (this.isNode(node)) {
      const ps = attributesString((node as Node).attributes);
      return `<link ${ps.slice(0, -1)}></link>`;
    } else {
      node = node ? `src="${node}" ` : '';
      return document.createComment(
        `<link ${node}execute by garfish(dynamic)></link>`,
      );
    }
  },

  createScriptCommentNode(node: Node | { code: string; src?: string }) {
    if (this.isNode(node)) {
      const { attributes, children } = node as Node;
      const ps = attributesString(attributes);
      const code = children?.[0] ? (children[0] as Text).content : '';
      return document.createComment(
        `<script ${ps} execute by garfish>${code}</script>`,
      );
    } else {
      const { src, code } = node as any;
      const url = src ? `src="${src}" ` : '';
      return document.createComment(
        `<script ${url}execute by garfish(dynamic)>${code}</script>`,
      );
    }
  },

  applyAttributes(el: Element, attributes: Attributes) {
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
  },
};
