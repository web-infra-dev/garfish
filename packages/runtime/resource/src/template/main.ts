import { parse } from 'himalaya';
import { Node, Text } from './renderApi';
import {
  isNode,
  isText,
  isCommentNode,
  createElement,
  createTextNode,
} from './renderApi';

type Renderer = Record<string, (node: Node) => Element | Comment>;

// Convert irregular grammar to compliant grammar
// 1M text takes about time:
//    chrome 30ms
//    safari: 25ms
//    firefox: 25ms
const transformCode = (code: string) => {
  const node = document.createElement('html');
  node.innerHTML = code;
  return node.innerHTML;
};

export class TemplateResource {
  public url: string | null;
  public astTree: Array<Node>;
  private pretreatmentStore: Record<string, any>;

  constructor(template: string, url?: string) {
    this.url = url || null;
    // About 1M text parse takes about 100ms
    this.astTree = parse(transformCode(template));
    // pretreatment resource
    this.getNodeByTagName('link', 'style', 'script');
  }

  getNodeByTagName<T>(...tags: Array<keyof T>) {
    let counter = 0;
    const collection: Record<keyof T, Array<Node>> = {} as any;

    for (const tag of tags as string[]) {
      if (this.pretreatmentStore[tag]) {
        counter++;
        collection[tag] = this.pretreatmentStore[tag];
      } else {
        this.pretreatmentStore[tag] = collection[tag] = [];
      }
    }

    if (counter !== tags.length) {
      const traverse = (node: Node | Text) => {
        if (node.type !== 'element') return;
        if (tags.indexOf(node.tagName as any) > -1) {
          collection[node.tagName].push(node);
        }
        for (const child of node.children) traverse(child);
      };
      for (const node of this.astTree) traverse(node);
    }
    return collection;
  }

  // Render dom tree
  createElements(renderer: Renderer, parent: Element) {
    const elements: Array<Element> = [];
    const traverse = (node: Node | Text, parentEl?: Element) => {
      let el = null;
      if (isCommentNode(node)) {
        // Filter comment node
      } else if (isText(node)) {
        el = createTextNode(node as Text);
        parentEl && parentEl.appendChild(el);
      } else if (isNode(node)) {
        const nodeType = el && el.nodeType;
        const { tagName, children } = node as Node;

        if (renderer[tagName]) {
          el = renderer[tagName](node as Node);
        } else {
          el = createElement(node as Node);
        }
        if (parentEl && el) parentEl.appendChild(el);
        // Filter "comment" and "document" node
        if (nodeType !== 8 && nodeType !== 10) {
          for (const child of children) {
            traverse(child, el);
          }
        }
      }
      return el;
    };

    for (const node of this.astTree) {
      if (isNode(node) && node.tagName !== '!doctype') {
        const el = traverse(node, parent);
        el && elements.push(el);
      }
    }
    return elements;
  }
}
