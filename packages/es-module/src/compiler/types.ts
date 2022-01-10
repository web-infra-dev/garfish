// Inspired by `@babel/types`
// https://babeljs.io/docs/en/babel-parser
// Filter out ts, jsx related code judgments,
// and modify the judgments to estree specifications
import type {
  Node,
  Property,
  Identifier,
  RestElement,
  ForInStatement,
  ForOfStatement,
  BlockStatement,
  LabeledStatement,
  ArrayPattern,
  ObjectPattern,
  AssignmentPattern,
  ClassDeclaration,
  CatchClause,
  VariableDeclaration,
  FunctionDeclaration,
  FunctionExpression,
  ArrowFunctionExpression,
  ExportSpecifier,
  ExportAllDeclaration,
  ExportNamedDeclaration,
  ExportDefaultDeclaration,
  ImportDeclaration,
  ImportDefaultSpecifier,
  ImportNamespaceSpecifier,
} from 'estree';

function shallowEqual<T extends object>(
  actual: object,
  expected: T,
): actual is T {
  const keys = Object.keys(expected);
  for (const key of keys) {
    if (actual[key] !== expected[key]) {
      return false;
    }
  }
  return true;
}

export function isIdentifier(node?: object): node is Identifier {
  if (!node) return false;
  return (node as Node).type === 'Identifier';
}

export function isVar(node?: object): node is VariableDeclaration {
  return isVariableDeclaration(node, { kind: 'var' });
}

export function isLet(node?: object) {
  return isVariableDeclaration(node) && node.kind !== 'var';
}

export function isProperty(node?: object): node is Property {
  if (!node) return false;
  return (node as Node).type === 'Property';
}

export function isBlockScoped(node?: object) {
  return isFunctionDeclaration(node) || isClassDeclaration(node) || isLet(node);
}

export function isArrowFunctionExpression(
  node?: object,
): node is ArrowFunctionExpression {
  if (!node) return false;
  return (node as Node).type === 'ArrowFunctionExpression';
}

export function isForXStatement(
  node?: object,
): node is ForInStatement | ForOfStatement {
  if (!node) return false;
  const nodeType = (node as Node).type;
  return 'ForInStatement' === nodeType || 'ForOfStatement' === nodeType;
}

export function isBlockStatement(node?: object): node is BlockStatement {
  if (!node) return false;
  return (node as Node).type === 'BlockStatement';
}

export function isFunctionExpression(
  node?: object,
): node is FunctionExpression {
  if (!node) return false;
  return (node as Node).type === 'FunctionExpression';
}

export function isObjectMethod(node?: object) {
  if (!node) return false;
  if (!isProperty(node)) return false;
  return isFunction(node.value);
}

export function isFunction(node?: object) {
  if (!node) return false;
  const nodeType = (node as Node).type;
  if (
    'FunctionDeclaration' === nodeType ||
    'FunctionExpression' === nodeType ||
    'ArrowFunctionExpression' === nodeType ||
    'MethodDefinition' === nodeType ||
    // @ts-ignore
    'ClassPrivateMethod' === nodeType // acorn 支持私有属性后，替换为 estree 的类型
  ) {
    return true;
  }
  if (isObjectMethod(node)) return true;
  return false;
}

export function isRestElement(node?: object): node is RestElement {
  if (!node) return false;
  return 'RestElement' === (node as Node).type;
}

export function isArrayPattern(node?: object): node is ArrayPattern {
  if (!node) return false;
  return 'ArrayPattern' === (node as Node).type;
}

export function isObjectPattern(node?: object): node is ObjectPattern {
  if (!node) return false;
  return 'ObjectPattern' === (node as Node).type;
}

export function isAssignmentPattern(node?: object): node is AssignmentPattern {
  if (!node) return false;
  return 'AssignmentPattern' === (node as Node).type;
}

export function isPattern(
  node?: object,
): node is ArrayPattern | ObjectPattern | AssignmentPattern {
  if (!node) return false;
  const nodeType = (node as Node).type;
  if (
    'AssignmentPattern' === nodeType ||
    'ArrayPattern' === nodeType ||
    'ObjectPattern' === nodeType
  ) {
    return true;
  }
  return false;
}

export function isCatchClause(node?: object): node is CatchClause {
  if (!node) return false;
  return (node as Node).type === 'CatchClause';
}

export function isProgram(node?: object) {
  if (!node) return false;
  return (node as Node).type === 'Program';
}

export function isFunctionParent(node?: object) {
  if (!node) return false;
  const nodeType = (node as Node).type;
  if (
    'FunctionDeclaration' === nodeType ||
    'FunctionExpression' === nodeType ||
    'ArrowFunctionExpression' === nodeType ||
    'MethodDefinition' === nodeType ||
    // @ts-ignore
    'ClassPrivateMethod' === nodeType ||
    // @ts-ignore
    'StaticBlock' === nodeType ||
    isObjectMethod(node)
  ) {
    return true;
  }
  return false;
}

export function isBlockParent(node?: object) {
  if (!node) return false;
  const nodeType = (node as Node).type;
  if (
    'BlockStatement' === nodeType ||
    'CatchClause' === nodeType ||
    'DoWhileStatement' === nodeType ||
    'ForInStatement' === nodeType ||
    'ForStatement' === nodeType ||
    'FunctionDeclaration' === nodeType ||
    'FunctionExpression' === nodeType ||
    'Program' === nodeType ||
    'SwitchStatement' === nodeType ||
    'WhileStatement' === nodeType ||
    'ArrowFunctionExpression' === nodeType ||
    'ForOfStatement' === nodeType ||
    'MethodDefinition' === nodeType ||
    isObjectMethod(node) ||
    // @ts-ignore
    'ClassPrivateMethod' === nodeType ||
    // @ts-ignore
    'StaticBlock' === nodeType
  ) {
    return true;
  }
  return false;
}

export function isLabeledStatement(node?: object): node is LabeledStatement {
  if (!node) return false;
  return (node as Node).type === 'LabeledStatement';
}

export function isFunctionDeclaration(
  node?: object,
): node is FunctionDeclaration {
  if (!node) return false;
  return (node as Node).type === 'FunctionDeclaration';
}

export function isVariableDeclaration(
  node?: object,
  opts?: object,
): node is VariableDeclaration {
  if (!node) return false;
  const nodeType = (node as Node).type;
  if (nodeType === 'VariableDeclaration') {
    if (typeof opts === 'undefined') {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }
  return false;
}

export function isClassDeclaration(node?: object): node is ClassDeclaration {
  if (!node) return false;
  return (node as Node).type === 'ClassDeclaration';
}

export function isExportAllDeclaration(
  node?: object,
): node is ExportAllDeclaration {
  if (!node) return false;
  return (node as Node).type === 'ExportAllDeclaration';
}

export function isExportDeclaration(
  node?: object,
): node is
  | ExportAllDeclaration
  | ExportDefaultDeclaration
  | ExportNamedDeclaration {
  if (!node) return false;
  const nodeType = (node as Node).type;
  if (
    'ExportAllDeclaration' === nodeType ||
    'ExportDefaultDeclaration' === nodeType ||
    'ExportNamedDeclaration' === nodeType
  ) {
    return true;
  }
  return false;
}

export function isExportDefaultDeclaration(
  node?: object,
): node is ExportDefaultDeclaration {
  if (!node) return false;
  return (node as Node).type === 'ExportDefaultDeclaration';
}

export function isExportSpecifier(node?: object): node is ExportSpecifier {
  if (!node) return false;
  return (node as Node).type === 'ExportSpecifier';
}

export function isImportDeclaration(node?: object): node is ImportDeclaration {
  if (!node) return false;
  return (node as Node).type === 'ImportDeclaration';
}

export function isImportDefaultSpecifier(
  node?: object,
): node is ImportDefaultSpecifier {
  if (!node) return false;
  return (node as Node).type === 'ImportDefaultSpecifier';
}

export function isImportNamespaceSpecifier(
  node?: object,
): node is ImportNamespaceSpecifier {
  if (!node) return false;
  return (node as Node).type === 'ImportNamespaceSpecifier';
}

export function isDeclaration(node?: object) {
  if (!node) return false;
  const nodeType = (node as Node).type;
  if (
    'FunctionDeclaration' === nodeType ||
    'VariableDeclaration' === nodeType ||
    'ClassDeclaration' === nodeType ||
    'ExportAllDeclaration' === nodeType ||
    'ExportDefaultDeclaration' === nodeType ||
    'ExportNamedDeclaration' === nodeType ||
    'ImportDeclaration' === nodeType
  ) {
    return true;
  }
  return false;
}

export function isScope(node: Node, parent: Node) {
  if (isBlockStatement(node) && (isFunction(parent) || isCatchClause(parent))) {
    return false;
  }
  if (isPattern(node) && (isFunction(parent) || isCatchClause(parent))) {
    return true;
  }
  return isScopable(node);
}

export function isScopable(node?: object) {
  if (!node) return false;
  const nodeType = (node as Node).type;
  if (
    'BlockStatement' === nodeType ||
    'CatchClause' === nodeType ||
    'DoWhileStatement' === nodeType ||
    'ForInStatement' === nodeType ||
    'ForStatement' === nodeType ||
    'FunctionDeclaration' === nodeType ||
    'FunctionExpression' === nodeType ||
    'Program' === nodeType ||
    'SwitchStatement' === nodeType ||
    'WhileStatement' === nodeType ||
    'ArrowFunctionExpression' === nodeType ||
    'ClassExpression' === nodeType ||
    'ClassDeclaration' === nodeType ||
    'ForOfStatement' === nodeType ||
    'MethodDefinition' === nodeType ||
    isObjectMethod(node) ||
    // @ts-ignore
    'ClassPrivateMethod' === nodeType ||
    // @ts-ignore
    'StaticBlock' === nodeType
  ) {
    return true;
  }
  return false;
}

export function isReferenced(node: Node, parent: Node, grandparent: Node) {
  switch (parent.type) {
    // yes: PARENT[NODE]
    // yes: NODE.child
    // no: parent.NODE
    case 'MemberExpression':
    // @ts-ignore
    case 'OptionalMemberExpression': // acorn 还没有实现可选链
      if (parent.property === node) {
        return !!parent.computed;
      }
      return parent.object === node;

    // no: let NODE = init;
    // yes: let id = NODE;
    case 'VariableDeclarator':
      return parent.init === node;

    // yes: () => NODE
    // no: (NODE) => {}
    case 'ArrowFunctionExpression':
      return parent.body === node;

    // no: class { #NODE; }
    // no: class { get #NODE() {} }
    // no: class { #NODE() {} }
    // no: class { fn() { return this.#NODE; } }
    // @ts-ignore
    case 'PrivateName': // acorn 还没有实现私有属性
      return false;

    // method:
    //  no: class { NODE() {} }
    //  yes: class { [NODE]() {} }
    //  no: class { foo(NODE) {} }
    // property
    //  yes: { [NODE]: "" }
    //  no: { NODE: "" }
    //  depends: { NODE }
    //  depends: { key: NODE }
    case 'MethodDefinition': // babel 替换为了 ClassMethod
    // @ts-ignore
    case 'ClassPrivateMethod': // acorn 还没有实现私有方法
    case 'Property':
      if (parent.key === node) {
        return !!parent.computed;
      }
      if (isObjectMethod(node)) {
        return false;
      } else {
        // parent.value === node
        return !grandparent || grandparent.type !== 'ObjectPattern';
      }

    // no: class { NODE = value; }
    // yes: class { [NODE] = value; }
    // yes: class { key = NODE; }
    // case 'ClassProperty':
    case 'PropertyDefinition': // acorn 还没有实现类的属性定义
      if (parent.key === node) {
        return !!parent.computed;
      }
      return true;
    // @ts-ignore
    case 'ClassPrivateProperty': // acorn 还没有实现
      // @ts-ignore
      return parent.key !== node;

    // no: class NODE {}
    // yes: class Foo extends NODE {}
    case 'ClassDeclaration':
    case 'ClassExpression':
      return parent.superClass === node;

    // yes: left = NODE;
    // no: NODE = right;
    case 'AssignmentExpression':
      return parent.right === node;

    // no: [NODE = foo] = [];
    // yes: [foo = NODE] = [];
    case 'AssignmentPattern':
      return parent.right === node;

    // no: NODE: for (;;) {}
    case 'LabeledStatement':
      return false;

    // no: try {} catch (NODE) {}
    case 'CatchClause':
      return false;

    // no: function foo(...NODE) {}
    case 'RestElement':
      return false;

    case 'BreakStatement':
    case 'ContinueStatement':
      return false;

    // no: function NODE() {}
    // no: function foo(NODE) {}
    case 'FunctionDeclaration':
    case 'FunctionExpression':
      return false;

    // no: export NODE from "foo";
    // no: export * as NODE from "foo";
    case 'ExportAllDeclaration':
      return false;

    // no: export { foo as NODE };
    // yes: export { NODE as foo };
    // no: export { NODE as foo } from "foo";
    case 'ExportSpecifier':
      if ((grandparent as ExportNamedDeclaration)?.source) {
        return false;
      }
      return parent.local === node;

    // no: import NODE from "foo";
    // no: import * as NODE from "foo";
    // no: import { NODE as foo } from "foo";
    // no: import { foo as NODE } from "foo";
    // no: import NODE from "bar";
    case 'ImportDefaultSpecifier':
    case 'ImportNamespaceSpecifier':
    case 'ImportSpecifier':
      return false;

    // no: import "foo" assert { NODE: "json" }
    // @ts-ignore
    case 'ImportAttribute': // acorn 还没有实现
      return false;

    // no: [NODE] = [];
    // no: ({ NODE }) = [];
    case 'ObjectPattern':
    case 'ArrayPattern':
      return false;

    // no: new.NODE
    // no: NODE.target
    case 'MetaProperty':
      return false;
  }
  return true;
}
