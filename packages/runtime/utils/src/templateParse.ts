import { error } from './utils';
import { Node as VNode } from './domApis';

enum ElementType {
  TEXT = 3,
  COMMENT = 8,
  ELEMENT = 1,
}

function Attributes({ name, value }) {
  this.key = name;
  this.value = value;
}

const generateAttributes = (el: Element) => {
  const list = [];
  const attrs = el.attributes;
  const len = attrs.length;

  if (len > 0) {
    // Optimize for the most common cases
    if (len === 1) {
      list[0] = new Attributes(attrs[0]);
    } else if (len === 2) {
      list[0] = new Attributes(attrs[0]);
      list[1] = new Attributes(attrs[1]);
    } else {
      for (let i = 0; i < len; i++) {
        list[i] = new Attributes(attrs[i]);
      }
    }
  }
  return list;
};

const createElement = (el: Element, filter: (el: VNode) => VNode) => {
  switch (el.nodeType) {
    case ElementType.TEXT:
      return {
        type: 'text',
        content: el.textContent,
      };
    case ElementType.COMMENT:
      return {
        type: 'comment',
        content: el.textContent,
      };
    case ElementType.ELEMENT:
      return filter({
        type: 'element',
        tagName: el.tagName.toLowerCase(),
        attributes: generateAttributes(el),
        children: Array.from(el.childNodes).map((node) => {
          return createElement(node as Element, filter);
        }),
      });
    default:
      error(`Invalid node type "${el.nodeType}"`);
  }
};

// 1M text takes about time 60ms
export function templateParse(code?: string, tags?: Array<string>) {
  let astTree: Array<VNode> = [];
  const htmlNode = document.createElement('html');
  const collectionEls: Record<string, Array<VNode>> = {};
  const filter = (el) => {
    if (tags.includes(el.tagName)) {
      collectionEls[el.tagName].push(el);
    }
    return el;
  };

  htmlNode.innerHTML = code;
  for (const tag of tags) {
    collectionEls[tag] = [];
  }
  astTree = Array.from(htmlNode.childNodes).map((node) => {
    return createElement(node as Element, filter);
  });
  return [astTree, collectionEls] as const;
}
