import { createElement, createTextNode, isComment, isVNode, isVText, rawAppendChild, VNode, VText } from "@garfish/utils";
import { transformCode } from "../utils";
import { parse } from 'himalaya';

export interface HtmlResourceOpts {
  url: string;
  code: string;
  size: number;
}

export class HtmlResource {
  type = 'html';
  opts: HtmlResourceOpts;
  ast: Array<VNode>;
  jss: Array<VNode>;
  links: Array<VNode>;
  styles: Array<VNode>;

  constructor(opts: HtmlResourceOpts) {
    this.opts = opts;
    // 1M 左右的文本 parse 大约需要 100ms
    this.ast = parse(transformCode(opts.code));
    this.opts.code = '';

    const vnodes = this.queryVNodesByTagNames(['link', 'style', 'script']);
    this.jss = vnodes.script;
    this.links = vnodes.link;
    this.styles = vnodes.style;
  }

  private queryVNodesByTagNames(tagNames: Array<string>) {
    const res: Record<string, Array<VNode>> = {};
    for (const tagName of tagNames) {
      res[tagName] = [];
    }
    const traverse = (vnode: VNode | VText) => {
      if (vnode.type === 'element') {
        const { tagName, children } = vnode;
        if (tagNames.indexOf(tagName) > -1) {
          res[tagName].push(vnode);
        }
        children.forEach((vnode) => traverse(vnode));
      }
    };
    this.ast.forEach((vnode) => traverse(vnode));
    return res;
  }

  getVNodesByTagName(tagName: string) {
    if (tagName === 'link') return this.links;
    if (tagName === 'style') return this.styles;
    if (tagName === 'script') return this.jss;
    return this.queryVNodesByTagNames([tagName])[tagName];
  }

  renderElements(
    cusRender: Record<string, (vnode: VNode) => Element | Comment>,
    parentEl?: Element,
  ) {
    const els = [];
    const traverse = (vnode: VNode | VText, parentEl?: Element) => {
      let el = null;
      if (isComment(vnode)) {
        // 过滤注释
      } else if (isVText(vnode)) {
        el = createTextNode(vnode as VText);
        parentEl && rawAppendChild.call(parentEl, el);
      } else if (isVNode(vnode)) {
        const { tagName, children } = vnode as VNode;
        if (cusRender && cusRender[tagName]) {
          el = cusRender[tagName](vnode as VNode);
        } else {
          el = createElement(vnode as VNode);
        }

        if (parentEl && el) {
          rawAppendChild.call(parentEl, el);
        }

        const nodeType = el && el.nodeType;
        if (nodeType !== 8 && nodeType !== 10) {
          for (const child of children) {
            traverse(child, el);
          }
        }
      }
      return el;
    };

    this.ast.forEach((vnode) => {
      if (isVNode(vnode) && vnode.tagName !== '!doctype') {
        const el = traverse(vnode, parentEl);
        el && els.push(el);
      }
    });
    return els;
  }
}
