interface Position {
  content: string;
  source?: string | null;
  end: {
    line: number;
    column: number;
  };
  start: {
    line: number;
    column: number;
  };
}

export interface BaseNode<T> {
  type: T;
  position: Position;
  parent: Node | null;
}

export interface RuleNode extends BaseNode<'rule'> {
  selectors: Array<string>;
  declarations: Array<DeclNode>;
}

export interface HostNode extends BaseNode<'host'> {
  rules: Array<Node>;
}

export interface PageNode extends BaseNode<'page'> {
  selectors: Array<string>;
  declarations: Array<DeclNode>;
}
export interface MediaNode extends BaseNode<'media'> {
  media: string;
  rules: Array<Node>;
}

export interface ImportNode extends BaseNode<'import'> {
  import: string;
}

export interface CommentNode extends BaseNode<'comment'> {
  comment: string;
}

export interface CharsetNode extends BaseNode<'charset'> {
  charset: string;
}

export interface SupportsNode extends BaseNode<'supports'> {
  supports: string;
  rules: Array<Node>;
}

export interface FontFaceNode extends BaseNode<'font-face'> {
  declarations: Array<DeclNode>;
}

export interface NamespaceNode extends BaseNode<'namespace'> {
  namespace: string;
}

export interface DeclNode extends BaseNode<'declaration'> {
  value: string;
  property: string;
}
export interface KeyframeNode extends BaseNode<'keyframe'> {
  values: Array<string>;
  declarations: Array<DeclNode>;
}

export interface CustomMediaNode extends BaseNode<'custom-media'> {
  name: string;
  media: string;
}

export interface DocumentNode extends BaseNode<'document'> {
  vendor?: string;
  document: string;
  rules: Array<Node>;
}

export interface KeyframesNode extends BaseNode<'keyframes'> {
  name: string;
  vendor?: string;
  keyframes: Array<KeyframeNode>;
}

export interface StylesheetNode extends BaseNode<'stylesheet'> {
  stylesheet: {
    source?: string;
    rules: Array<Node>;
    parsingErrors: Array<Error>;
  };
}

export type Node =
  | DeclNode
  | PageNode
  | HostNode
  | RuleNode
  | MediaNode
  | ImportNode
  | CharsetNode
  | CommentNode
  | SupportsNode
  | DocumentNode
  | FontFaceNode
  | KeyframeNode
  | KeyframesNode
  | NamespaceNode
  | StylesheetNode
  | CustomMediaNode;
