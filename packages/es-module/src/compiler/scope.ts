// Inspired by `@babel/traverse`
import type {
  Node,
  Identifier,
  LabeledStatement,
  ExportSpecifier,
  ExportDefaultDeclaration,
} from 'estree';
import {
  isPattern,
  isFunction,
  isLabeledStatement,
  isClassDeclaration,
  isImportDeclaration,
  isExportDeclaration,
  isVariableDeclaration,
  isFunctionDeclaration,
  isArrowFunctionExpression,
} from './types';
import { getBindingIdentifiers } from './state';

type BindingKind =
  | 'var' /* var declarator */
  | 'let' /* let declarator, class declaration id, catch clause parameters */
  | 'const' /* const declarator */
  | 'module' /* import specifiers */
  | 'hoisted' /* function declaration id */
  | 'param' /* function declaration parameters */
  | 'local' /* function expression id, class expression id */
  | 'unknown'; /* export specifiers */

export interface Binding {
  kind: BindingKind;
  node: Identifier;
  references: Set<Identifier>;
  constantViolations: Set<Node>;
}

export class Scope {
  public node: Node;
  public parent?: Scope;
  public labels = new Map();
  public globals = Object.create(null);
  public bindings = Object.create(null); // 原型只能是 null

  constructor(node: Node, parent?: Scope) {
    this.node = node;
    this.parent = parent;
  }

  private checkBlockScopedCollisions(
    local: Binding,
    kind: BindingKind,
    name: string,
  ) {
    if (kind === 'param') return;
    // 函数自己的声明规范中是一个独立的作用域，可以被覆盖
    if (local.kind === 'local') return;
    if (
      kind === 'let' ||
      local.kind === 'let' ||
      local.kind === 'const' ||
      local.kind === 'module' ||
      // don't allow a local of param with a kind of let
      (local.kind === 'param' && kind === 'const')
    ) {
      throw new Error(`Duplicate declaration "${name}"`);
    }
  }

  registerLabel(node: LabeledStatement) {
    this.labels.set(node.label.name, node);
  }

  addGlobal(node: Identifier) {
    this.globals[node.name] = node;
  }

  reference(name: string, node: Identifier) {
    const binding = this.getBinding(name);
    if (binding) {
      binding.references.add(node);
    }
  }

  registerConstantViolation(name: string, node: Node) {
    const binding = this.getBinding(name);
    if (binding) {
      binding.constantViolations.add(node);
    }
  }

  getBinding(name: string) {
    let scope: Scope = this;
    let previousNode;

    do {
      const binding = scope.bindings[name];
      if (binding) {
        if (
          isPattern(previousNode) &&
          binding.kind !== 'param' &&
          binding.kind !== 'local'
        ) {
          // 这里不做任何事情
          // 如果是 pattern 中作用域中引用了自身没定义的变量，不能在函数体内寻找
          // 他是独立的作用域，并不是父子关系，这里只是为了性能合并在了一起，所以需要继续往外找。
          // 但是有两种情况特殊
          //  1. param 是参数，可以被函数体内访问
          //  2. local 是函数自身的声明，这个一层的作用域也是可以被函数体内访问的
        } else {
          return binding;
        }
      } else if (
        !binding &&
        name === 'arguments' && // arguments 是不可见的函数内部参数声明
        isFunction(scope.node) &&
        isArrowFunctionExpression(scope.node)
      ) {
        break;
      }
      previousNode = scope.node;
    } while ((scope = scope.parent));
  }

  registerBinding(kind: BindingKind, name: string, node: Node) {
    if (!kind) throw new ReferenceError('no `kind`');
    const binding = this.bindings[name];

    if (binding) {
      // 遍历的时候会有重复塞入
      if (binding.node === node) return;
      // 检查作用域的碰撞
      this.checkBlockScopedCollisions(binding, kind, name);
      // 如果顺利通过，则代表被更改了，重复的声明也是更改
      this.registerConstantViolation(name, node);
    } else {
      // 我们的案例是 esModule, 里面不可能有 with 表达式
      this.bindings[name] = {
        kind,
        node,
        references: new Set(),
        constantViolations: new Set(),
      };
    }
  }

  // @babel/types/src/retrievers/getBindingIdentifiers.ts
  registerDeclaration(node: Node) {
    if (isLabeledStatement(node)) {
      this.registerLabel(node);
    } else if (isFunctionDeclaration(node)) {
      this.registerBinding('hoisted', node.id.name, node);
    } else if (isVariableDeclaration(node)) {
      const { declarations } = node;
      for (const decl of declarations) {
        // node.kind 有 `var`, `let`, `const`
        const ids = getBindingIdentifiers(decl.id);
        for (const { name } of ids) {
          this.registerBinding(node.kind, name, decl);
        }
      }
    } else if (isClassDeclaration(node)) {
      this.registerBinding('let', node.id.name, node);
    } else if (isImportDeclaration(node)) {
      const specifiers = node.specifiers;
      for (const specifier of specifiers) {
        this.registerBinding('module', specifier.local.name, specifier);
      }
    } else if (isExportDeclaration(node)) {
      const { declaration } = node as ExportDefaultDeclaration;
      if (
        isClassDeclaration(declaration) ||
        isFunctionDeclaration(declaration) ||
        isVariableDeclaration(declaration)
      ) {
        this.registerDeclaration(declaration);
      }
    } else {
      this.registerBinding(
        'unknown',
        (node as ExportSpecifier).exported.name,
        node,
      );
    }
  }
}
