import { __MockHtml__, __MockHead__, __MockBody__ } from '@garfish/utils';
import {
  Node,
  DeclNode,
  PageNode,
  HostNode,
  RuleNode,
  MediaNode,
  ImportNode,
  CharsetNode,
  CommentNode,
  SupportsNode,
  DocumentNode,
  FontFaceNode,
  KeyframeNode,
  KeyframesNode,
  NamespaceNode,
  StylesheetNode,
  CustomMediaNode,
  ContainerNode,
} from './globalTypes';
import { processAnimation } from './animationParser';

const animationRE = /^(-\w+-)?animation$/;
const animationNameRE = /^(-\w+-)?animation-name$/;

class Compiler {
  public level = 1;
  public id: string;

  constructor(id: string) {
    this.id = id || '';
  }

  // 可以重写覆盖 emit
  emit(str: string, _?: any) {
    return str;
  }

  visit(node: Node) {
    return this[node.type](node as any);
  }

  mapVisit(nodes: Array<Node>, delim: string) {
    let i = 0;
    let buf = '';
    const len = nodes.length;

    for (; i < len; i++) {
      buf += this.visit(nodes[i]);
      if (delim && i < len - 1) {
        buf += this.emit(delim);
      }
    }
    return buf;
  }

  addScope(selectors: Array<string>) {
    if (!this.id) return selectors;

    return selectors.map((s) => {
      // prettier-ignore
      s =
        s === 'html' || s === ':root'
          ? `[${__MockHtml__}]`
          : s === 'body'
            ? `[${__MockBody__}]`
            : s === 'head'
              ? `[${__MockHead__}]`
              : s;
      return `#${this.id} ${s}`;
    });
  }

  indent(level?: number) {
    if (typeof level === 'number') {
      this.level += level;
      return '';
    }
    return Array(this.level).join('  ');
  }

  compile(node: StylesheetNode) {
    return this.stylesheet(node);
  }

  stylesheet(node: StylesheetNode) {
    return this.mapVisit(node.stylesheet.rules, '\n\n');
  }

  comment(node: CommentNode) {
    return this.emit(`${this.indent()}/*${node.comment}*/`, node.position);
  }

  import(node: ImportNode) {
    return this.emit(`@import ${node.import};`, node.position);
  }

  charset(node: CharsetNode) {
    return this.emit(`@charset ${node.charset};`, node.position);
  }

  namespace(node: NamespaceNode) {
    return this.emit(`@namespace ${node.namespace};`, node.position);
  }

  media(node: MediaNode) {
    return (
      this.emit(`@media ${node.media}`, node.position) +
      this.emit(` {\n${this.indent(1)}`) +
      this.mapVisit(node.rules, '\n\n') +
      this.emit(`${this.indent(-1)}\n}`)
    );
  }

  container(node: ContainerNode) {
    return (
      this.emit(`@container ${node.container}`, node.position) +
      this.emit(` {\n${this.indent(1)}`) +
      this.mapVisit(node.rules, '\n\n') +
      this.emit(`${this.indent(-1)}\n}`)
    );
  }

  document(node: DocumentNode) {
    const doc = `@${node.vendor || ''}document ${node.document}`;
    return (
      this.emit(doc, node.position) +
      this.emit(`  {\n${this.indent(1)}`) +
      this.mapVisit(node.rules, '\n\n') +
      this.emit(`${this.indent(-1)}\n}`)
    );
  }

  supports(node: SupportsNode) {
    return (
      this.emit(`@supports ${node.supports}`, node.position) +
      this.emit(` {\n${this.indent(1)}`) +
      this.mapVisit(node.rules, '\n\n') +
      this.emit(`${this.indent(-1)}\n}`)
    );
  }

  keyframes(node: KeyframesNode) {
    const name = this.id ? `${this.id}-${node.name}` : node.name;
    return (
      this.emit(`@${node.vendor || ''}keyframes ${name}`, node.position) +
      this.emit(` {\n${this.indent(1)}`) +
      this.mapVisit(node.keyframes, '\n') +
      this.emit(`${this.indent(-1)}}`)
    );
  }

  keyframe(node: KeyframeNode) {
    const decls = node.declarations;
    return (
      this.emit(this.indent()) +
      this.emit(node.values.join(', '), node.position) +
      this.emit(` {\n${this.indent(1)}`) +
      this.mapVisit(decls, '\n') +
      this.emit(`${this.indent(-1)}\n${this.indent()}}\n`)
    );
  }

  page(node: PageNode) {
    // prettier-ignore
    const sel = node.selectors.length
      ? this.addScope(node.selectors).join(', ') + ' '
      : '';

    return (
      this.emit(`@page ${sel}`, node.position) +
      this.emit('{\n') +
      this.emit(this.indent(1)) +
      this.mapVisit(node.declarations, '\n') +
      this.emit(this.indent(-1)) +
      this.emit('\n}')
    );
  }

  host(node: HostNode) {
    return (
      this.emit('@host', node.position) +
      this.emit(` {\n${this.indent(1)}`) +
      this.mapVisit(node.rules, '\n\n') +
      this.emit(`${this.indent(-1)}\n}`)
    );
  }

  rule(node: RuleNode) {
    const indent = this.indent();
    const decls = node.declarations;
    if (!decls.length) return '';

    return (
      this.emit(
        this.addScope(node.selectors)
          .map((s) => indent + s)
          .join(',\n'),
        node.position,
      ) +
      this.emit(' {\n') +
      this.emit(this.indent(1)) +
      this.mapVisit(decls, '\n') +
      this.emit(this.indent(-1)) +
      this.emit(`\n${this.indent()}}`)
    );
  }

  declaration(node: DeclNode) {
    // eslint-disable-next-line prefer-const
    let { value, property, position } = node;

    if (this.id) {
      if (animationRE.test(property)) {
        value = processAnimation(value, this.id);
      } else if (animationNameRE.test(property)) {
        value = value
          .split(',')
          .map((v) => (v === 'none' ? v : `${v.trim()}-${this.id}`))
          .join(',');
      }
    }
    return (
      this.emit(this.indent()) +
      this.emit(`${property}: ${value}`, position) +
      this.emit(';')
    );
  }

  'font-face'(node: FontFaceNode) {
    return (
      this.emit('@font-face ', node.position) +
      this.emit('{\n') +
      this.emit(this.indent(1)) +
      this.mapVisit(node.declarations, '\n') +
      this.emit(this.indent(-1)) +
      this.emit('\n}')
    );
  }

  'custom-media'(node: CustomMediaNode) {
    return this.emit(
      `@custom-media ${node.name} ${node.media};`,
      node.position,
    );
  }
}

export function stringify(node: StylesheetNode, id: string) {
  const compiler = new Compiler(id);
  return compiler.compile(node);
}
