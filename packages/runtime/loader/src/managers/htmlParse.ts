import { warn } from '@garfish/utils';

enum ElementType {
  ELEMENT = 1,
  TEXT = 3,
  COMMENT = 8,
}

function Attributes({ name, value }) {
  this.key = name;
  this.value = value;
}

const collectionAttributes = (el: Element) => {
  const list = [];
  const attrs = el.attributes;
  const len = attrs.length;

  if (len > 0) {
    // if (len === 1) {
    //   list[0] = new Attributes(attrs[0]);
    // } else if (len === 2) {
    //   list[0] = new Attributes(attrs[0]);
    //   list[1] = new Attributes(attrs[1]);
    // } else {
    for (let i = 0; i < len; i++) {
      list[i] = new Attributes(attrs[i]);
    }
  }
  // }
  return list;
};

const createElement = (el: Node) => {
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
      return {
        type: 'element',
        tagName: (el as Element).tagName.toLowerCase(),
        attributes: collectionAttributes(el as Element),
        children: Array.from(el.childNodes).map(createElement),
      };
    default:
      __DEV__ && warn(`Invalid node type "${el.nodeType}"`);
  }
};

// 1M text takes about time 60ms
export function parse(code?: string) {
  if (!code) return [];
  const htmlNode = document.createElement('html');
  htmlNode.innerHTML = code;
  return Array.from(htmlNode.childNodes).map(createElement);
}
