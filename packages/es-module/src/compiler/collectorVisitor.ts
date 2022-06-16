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
    if (init && isVar(init)) {
      const scope = state.scopes.get(node);
      const parentScope =
        scope &&
        (state.getFunctionParent(scope) || state.getProgramParent(scope));
      for (const decl of init.declarations) {
        const ids = state.getBindingIdentifiers(decl.id);
        for (const { name } of ids) {
          parentScope && parentScope.registerBinding('var', name, decl);
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
      scope &&
      (state.getFunctionParent(scope) || state.getProgramParent(scope));
    parent && parent.registerDeclaration(node);
  },

  BlockScoped(node: Node, state: State) {
    let scope = state.scopes.get(node);
    if (scope && scope.node === node) scope = scope.parent;
    const parent = scope && state.getBlockParent(scope);
    parent && parent.registerDeclaration(node);
  },

  ImportDeclaration(node: ImportDeclaration, state: State) {
    const scope = state.scopes.get(node);
    const parent = scope && state.getBlockParent(scope);
    parent && parent.registerDeclaration(node);
  },

  Identifier(node: Identifier, state: State, ancestors: Array<Node>) {
    if (state.isReferenced(ancestors)) {
      const scope = state.scopes.get(node);
      scope &&
        state.defer.references.add(() => {
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
        scope && scope.registerConstantViolation(name, node);
      }
    } else if (isVar(left)) {
      const parentScope =
        scope &&
        (state.getFunctionParent(scope) || state.getProgramParent(scope));
      for (const decl of left.declarations) {
        const ids = state.getBindingIdentifiers(decl.id);
        for (const { name } of ids) {
          parentScope && parentScope.registerBinding('var', name, decl);
        }
      }
    }
  },

  // `acorn` Identifier 没有算上 ExportNamedDeclaration 中的值
  ExportNamedDeclaration(node: ExportNamedDeclaration, state: State) {
    const { specifiers } = node;
    if (specifiers && specifiers.length > 0) {
      for (const { local } of specifiers) {
        const scope = state.scopes.get(node);
        scope &&
          state.defer.references.add(() => {
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
    if (
      declaration &&
      (isClassDeclaration(declaration) || isFunctionDeclaration(declaration))
    ) {
      const { id } = declaration;
      if (!id) return;
      const ids = state.getBindingIdentifiers(id);
      scope &&
        state.defer.references.add(() => {
          return { ids, scope, type: 'export' };
        });
    } else if (declaration && isVariableDeclaration(declaration)) {
      for (const decl of declaration.declarations) {
        scope &&
          state.defer.references.add(() => {
            const ids = state.getBindingIdentifiers(decl.id);
            return { ids, scope, type: 'export' };
          });
      }
    }
  },

  LabeledStatement(node: LabeledStatement, state: State) {
    const scope = state.scopes.get(node);
    if (scope) {
      const parent = state.getBlockParent(scope);
      parent.registerDeclaration(node);
    }
  },

  AssignmentExpression(node: AssignmentExpression, state: State) {
    const scope = state.scopes.get(node);
    scope &&
      state.defer.assignments.add(() => {
        return { scope, ids: state.getBindingIdentifiers(node.left) };
      });
  },

  UpdateExpression(node: UpdateExpression, state: State) {
    const scope = state.scopes.get(node);
    scope &&
      state.defer.constantViolations.add(() => {
        return { scope, node: node.argument };
      });
  },

  UnaryExpression(node: UnaryExpression, state: State) {
    if (node.operator === 'delete') {
      const scope = state.scopes.get(node);
      scope &&
        state.defer.constantViolations.add(() => {
          return { scope, node: node.argument };
        });
    }
  },

  CatchClause(node: CatchClause, state: State) {
    const scope = state.scopes.get(node);
    const ids = node.param && state.getBindingIdentifiers(node.param);
    if (ids) {
      for (const { name } of ids) {
        scope && scope.registerBinding('let', name, node);
      }
    }
  },

  Function(node: Function, state: State) {
    const { params } = node;
    const scope = state.scopes.get(node);
    for (const param of params) {
      const ids = state.getBindingIdentifiers(param);
      for (const { name } of ids) {
        scope && scope.registerBinding('param', name, param);
      }
    }
    // Register function expression id after params. When the id
    // collides with a function param, the id effectively can't be
    // referenced: here we registered it as a constantViolation
    if (isFunctionExpression(node) && node.id) {
      scope && scope.registerBinding('local', node.id.name, node);
    }
  },

  ClassExpression(node: ClassExpression, state: State) {
    const { id } = node;
    const scope = state.scopes.get(node);
    if (id) {
      scope && scope.registerBinding('local', id.name, node);
    }
  },
};
