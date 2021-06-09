import { makeMap, noop, warn } from './utils';
import { rawDocument, rawRemoveChild } from './raw';

export interface VText {
  type: 'text' | 'comment';
  content: string;
}

export interface VNode {
  key?: string;
  type: 'element';
  tagName: string;
  children: Array<VNode | VText>;
  attributes: Array<Record<string, string | null>>;
}

export const toResolveUrl = (vnode: VNode, urlKey: string, baseUrl: string) => {
  const src = findProp(vnode, urlKey);
  if (src) {
    src.value = transformUrl(baseUrl, src.value);
  }
};

const xChar = 120; // x
const colonChar = 58; // :
const ns = 'http://www.w3.org/2000/svg';
const xlinkNS = 'http://www.w3.org/1999/xlink'; // xmlns:xlink
const xmlNS = 'http://www.w3.org/XML/1998/namespace'; // xmlns
const MATCH_CSS_URL = /url\(['"]?([^\)]+?)['"]?\)/g; // 匹配 css 中的 url

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

function attributesString(attributes: VNode['attributes']) {
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
    }
    // html entry 中只可能是 string
    else if (typeof value === 'string') {
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

export function removeElement(el: Element) {
  const parentNode = el && el.parentNode;
  if (parentNode) {
    rawRemoveChild.call(parentNode, el);
  }
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
  const ps = attributesString(vnode.attributes);
  return `<link ${ps.slice(0, -1)}></link>`;
}

export function createStyleNode(content: string) {
  const el = document.createElement('style');
  content && (el.textContent = content);
  applyAttributes(el, [{ key: 'type', value: 'text/css' }]);
  return el;
}

export function createScriptNode(vnode: VNode) {
  const { attributes, children } = vnode;
  const ps = attributesString(attributes);
  const code = children?.[0] ? (children[0] as VText).content : '';
  return document.createComment(
    `<script ${ps} execute by garfish>${code}</script>`,
  );
}

// Scheme: https://tools.ietf.org/html/rfc3986#section-3.1
// Absolute URL: https://tools.ietf.org/html/rfc3986#section-4.3
export function isAbsolute(url: string) {
  // `c:\\` 这种 case 返回 false，在浏览器中使用本地图片，应该用 file 协议
  if (!/^[a-zA-Z]:\\/.test(url)) {
    if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url)) {
      return true;
    }
  }
  return false;
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
  return code.replace(MATCH_CSS_URL, (k1, k2) => {
    if (isAbsolute(k2)) return k1;
    return `url("${transformUrl(resolvePath, k2)}")`;
  });
}

export function findProp(vnode: VNode, p: string) {
  return vnode.attributes?.find(({ key }) => key === p);
}

export function findTarget(el: Element | ShadowRoot, selectors: Array<string>) {
  for (const s of selectors) {
    const target = el.querySelector(s);
    if (target) return target;
  }
  return el;
}

export function setDocCurrentScript(
  target,
  code: string,
  define?: boolean,
  url?: string,
  async?: boolean,
) {
  if (!target) return noop;
  const el = rawDocument.createElement('script');
  if (async) {
    el.setAttribute('async', 'true');
  }

  if (url) {
    el.setAttribute('src', url);
  } else if (code) {
    el.textContent = code;
  }

  const set = (val) => {
    try {
      if (define) {
        Object.defineProperty(target, 'currentScript', {
          value: val,
          writable: true,
          configurable: true,
        });
      } else {
        target.currentScript = val;
      }
    } catch (e) {
      if (__DEV__) {
        warn(e);
      }
    }
  };

  set(el);
  return () => set(null);
}
