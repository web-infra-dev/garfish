// Inspired by `@babel/traverse`
import type {
  Node,
  Function,
  Identifier,
  CatchClause,
  ForStatement,
  ForInStatement,
  ForOfStatement,
  LabeledStatement,
  UnaryExpression,
  ClassExpression,
  UpdateExpression,
  AssignmentExpression,
  ImportDeclaration,
  ExportAllDeclaration,
  ExportNamedDeclaration,
  ExportDefaultDeclaration,
} from 'estree';
import type { State } from './state';
import {
  isVar,
  isPattern,
  isIdentifier,
  isBlockScoped,
  isClassDeclaration,
  isImportDeclaration,
  isExportDeclaration,
  isFunctionDeclaration,
  isExportAllDeclaration,
  isFunctionExpression,
  isVariableDeclaration,
} from './types';

export const collectorVisitor = {
  ForStatement(node: ForStatement, state: State) {
    const { init } = node;
    if (isVar(init)) {
      const scope = state.scopes.get(node);
      const parentScope =
        state.getFunctionParent(scope) || state.getProgramParent(scope);
      for (const decl of init.declarations) {
        const ids = state.getBindingIdentifiers(decl.id);
        for (const { name } of ids) {
          parentScope.registerBinding('var', name, decl);
        }
      }
    }
  },

  Declaration(node: Node, state: State) {
    if (isBlockScoped(node)) return;
    if (isImportDeclaration(node)) return;
    if (isExportDeclaration(node)) return;
    const scope = state.scopes.get(node);
    const parent =
      state.getFunctionParent(scope) || state.getProgramParent(scope);
    parent.registerDeclaration(node);
  },

  BlockScoped(node: Node, state: State) {
    let scope = state.scopes.get(node);
    if (scope.node === node) scope = scope.parent;
    const parent = state.getBlockParent(scope);
    parent.registerDeclaration(node);
  },

  ImportDeclaration(node: ImportDeclaration, state: State) {
    const scope = state.scopes.get(node);
    const parent = state.getBlockParent(scope);
    parent.registerDeclaration(node);
  },

  Identifier(node: Identifier, state: State, ancestors: Array<Node>) {
    if (state.isReferenced(ancestors)) {
      state.defer.references.add(() => {
        const scope = state.scopes.get(node);
        const ids = state.getBindingIdentifiers(node);
        return { scope, ids, type: 'identifier' };
      });
    }
  },

  ForXStatement(node: ForInStatement | ForOfStatement, state: State) {
    const scope = state.scopes.get(node);
    const { left } = node;
    if (isPattern(left) || isIdentifier(left)) {
      const ids = state.getBindingIdentifiers(left);
      for (const { name } of ids) {
        scope.registerConstantViolation(name, node);
      }
    } else if (isVar(left)) {
      const parentScope =
        state.getFunctionParent(scope) || state.getProgramParent(scope);
      for (const decl of left.declarations) {
        const ids = state.getBindingIdentifiers(decl.id);
        for (const { name } of ids) {
          parentScope.registerBinding('var', name, decl);
        }
      }
    }
  },

  // `acorn` Identifier 没有算上 ExportNamedDeclaration 中的值
  ExportNamedDeclaration(node: ExportNamedDeclaration, state: State) {
    const { specifiers } = node;
    if (specifiers && specifiers.length > 0) {
      for (const { local } of specifiers) {
        state.defer.references.add(() => {
          const scope = state.scopes.get(node);
          const ids = state.getBindingIdentifiers(local);
          return { scope, ids, type: 'identifier' };
        });
      }
    }
  },

  ExportDeclaration(
    node:
      | ExportAllDeclaration
      | ExportDefaultDeclaration
      | ExportNamedDeclaration,
    state: State,
  ) {
    // ExportAllDeclaration does not have `declaration`
    if (isExportAllDeclaration(node)) return;
    const { declaration } = node as ExportNamedDeclaration;
    const scope = state.scopes.get(node);
    if (isClassDeclaration(declaration) || isFunctionDeclaration(declaration)) {
      const { id } = declaration;
      if (!id) return;
      const ids = state.getBindingIdentifiers(id);
      state.defer.references.add(() => {
        return { ids, scope, type: 'export' };
      });
    } else if (isVariableDeclaration(declaration)) {
      for (const decl of declaration.declarations) {
        state.defer.references.add(() => {
          const ids = state.getBindingIdentifiers(decl.id);
          return { ids, scope, type: 'export' };
        });
      }
    }
  },

  LabeledStatement(node: LabeledStatement, state: State) {
    const scope = state.scopes.get(node);
    const parent = state.getBlockParent(scope);
    parent.registerDeclaration(node);
  },

  AssignmentExpression(node: AssignmentExpression, state: State) {
    state.defer.assignments.add(() => {
      const scope = state.scopes.get(node);
      return { scope, ids: state.getBindingIdentifiers(node.left) };
    });
  },

  UpdateExpression(node: UpdateExpression, state: State) {
    state.defer.constantViolations.add(() => {
      const scope = state.scopes.get(node);
      return { scope, node: node.argument };
    });
  },

  UnaryExpression(node: UnaryExpression, state: State) {
    if (node.operator === 'delete') {
      state.defer.constantViolations.add(() => {
        const scope = state.scopes.get(node);
        return { scope, node: node.argument };
      });
    }
  },

  CatchClause(node: CatchClause, state: State) {
    const scope = state.scopes.get(node);
    const ids = state.getBindingIdentifiers(node.param);
    for (const { name } of ids) {
      scope.registerBinding('let', name, node);
    }
  },

  Function(node: Function, state: State) {
    const { params } = node;
    const scope = state.scopes.get(node);
    for (const param of params) {
      const ids = state.getBindingIdentifiers(param);
      for (const { name } of ids) {
        scope.registerBinding('param', name, param);
      }
    }
    // Register function expression id after params. When the id
    // collides with a function param, the id effectively can't be
    // referenced: here we registered it as a constantViolation
    if (isFunctionExpression(node) && node.id) {
      scope.registerBinding('local', node.id.name, node);
    }
  },

  ClassExpression(node: ClassExpression, state: State) {
    const { id } = node;
    const scope = state.scopes.get(node);
    if (id) {
      scope.registerBinding('local', id.name, node);
    }
  },
};
