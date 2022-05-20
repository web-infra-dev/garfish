import {
  Node,
  Text,
  DOMApis,
  deepMerge,
  transformUrl,
  templateParse,
} from '@garfish/utils';

type Renderer = Record<string, (node: Node) => null | Element | Comment>;

export class TemplateManager {
  public url: string | null;
  public DOMApis = new DOMApis();
  public astTree: Array<Node> = [];
  private pretreatmentStore: Record<string, Node[]> = {};

  constructor(template: string, url?: string) {
    // The url is only base url, it may also be a js resource address.
    this.url = url || null;
    if (template) {
      const [astTree, collectionEls] = templateParse(template, [
        'meta',
        'link',
        'style',
        'script',
      ]);
      this.astTree = astTree;
      this.pretreatmentStore = collectionEls;
    }
  }

  getNodesByTagName<T>(...tags: Array<keyof T>) {
    let counter = 0;
    const collection: Record<keyof T, Array<Node>> = {} as any;

    for (const tag of tags as string[]) {
      if (this.pretreatmentStore[tag]) {
        counter++;
        collection[tag] = this.pretreatmentStore[tag];
      } else {
        collection[tag] = [];
      }
    }

    if (counter !== tags.length) {
      const traverse = (node: Node | Text) => {
        if (node.type !== 'element') return;
        if (
          tags.indexOf(node.tagName as any) > -1 &&
          !this.pretreatmentStore[node.tagName]
        ) {
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

        if (el) {
          const { nodeType, _ignoreChildNodes } = el;
          // Filter "comment" and "document" node
          if (!_ignoreChildNodes && nodeType !== 8 && nodeType !== 10) {
            for (const child of children) {
              traverse(child, el);
            }
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

  toResolveUrl(node: Node, type: string, baseUrl?: string) {
    const src = node.attributes?.find(({ key }) => key === type);
    if (src) {
      src.value = transformUrl(baseUrl, src.value);
    }
  }

  ignoreChildNodesCreation(node: Element) {
    if (node) {
      (node as any)._ignoreChildNodes = true;
    }
    return node;
  }

  findAllMetaNodes() {
    return this.getNodesByTagName('meta').meta;
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

  cloneNode(node: Node) {
    return deepMerge(node, {});
  }

  clone() {
    // @ts-ignore
    const cloned = new this.constructor();
    cloned.url = this.url;
    cloned.astTree = this.astTree;
    cloned.pretreatmentStore = this.pretreatmentStore;
    cloned.DOMApis = new DOMApis(this.DOMApis.document);
    return cloned;
  }
}
