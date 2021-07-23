import { warn } from '@garfish/utils';

enum ElementType {
  ELEMENT = 1,
  TEXT = 3,
  COMMENT = 8,
}

const collectionAttributes = (el: Element) => {
  const list = [];
  const attributes = el.attributes;
  for (let i = 0, l = attributes.length; i < l; i++) {
    const node = attributes[i];
    list[i] = {
      key: node.name,
      value: node.value,
    };
  }
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
