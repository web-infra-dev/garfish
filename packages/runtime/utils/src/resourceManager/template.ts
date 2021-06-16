import { parse } from 'himalaya';
import { deepMerge } from '../utils';
import { transformUrl } from '../domApis';
import { Node, Text, DOMApis } from './renderApi';

type Renderer = Record<string, (node: Node) => Element | Comment>;

// Convert irregular grammar to compliant grammar
// 1M text takes about time:
//   chrome 30ms
//   safari: 25ms
//   firefox: 25ms
const transformCode = (code: string) => {
  const node = document.createElement('html');
  node.innerHTML = code;
  return node.innerHTML;
};

export class TemplateManager {
  public DOMApis = DOMApis;
  public url: string | null;
  public astTree: Array<Node>;
  private pretreatmentStore: Record<string, Node[]> = {};

  constructor(template: string, url?: string) {
    // The url is only base url, it may also be a js resource address.
    this.url = url || null;
    // About 1M text parse takes about 100ms
    this.astTree = parse(transformCode(template));
    // Pretreatment resource
    this.getNodesByTagName('link', 'style', 'script');
  }

  getNodesByTagName<T>(...tags: Array<keyof T>) {
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
      if (this.DOMApis.isCommentNode(node)) {
        // Filter comment node
      } else if (this.DOMApis.isText(node)) {
        el = this.DOMApis.createTextNode(node as Text);
        parentEl && parentEl.appendChild(el);
      } else if (this.DOMApis.isNode(node)) {
        const { tagName, children } = node as Node;
        if (renderer[tagName]) {
          el = renderer[tagName](node as Node);
        } else {
          el = this.DOMApis.createElement(node as Node);
        }
        if (parentEl && el) parentEl.appendChild(el);

        const nodeType = el && el.nodeType;
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
      if (this.DOMApis.isNode(node) && node.tagName !== '!doctype') {
        const el = traverse(node, parent);
        el && elements.push(el);
      }
    }
    return elements;
  }

  cloneNode(node: Node) {
    return deepMerge(node, {});
  }

  toResolveUrl(node: Node, type: string, baseUrl: string) {
    const src = node.attributes?.find(({ key }) => key === type);
    if (src) {
      src.value = transformUrl(baseUrl, src.value);
    }
  }

  findAllLinkNodes() {
    return this.getNodesByTagName('link').link;
  }

  findAllJsNodes() {
    return this.getNodesByTagName('script').script;
  }

  findAttributeValue(node: Node, type: string) {
    return node.attributes?.find(({ key }) => key === type)?.value;
  }
}
