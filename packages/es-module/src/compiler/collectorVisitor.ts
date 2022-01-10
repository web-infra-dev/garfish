// Inspired by `@babel/traverse`
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
  ForStatement(node, state) {
    const { init } = node;
    if (isVar(init)) {
      const scope = state.scopes.get(node);
      const parent =
        state.getFunctionParent(scope) || state.getProgramParent(scope);
      for (const decl of init.declarations) {
        const ids = state.getBindingIdentifiers(decl.id);
        for (const { name } of ids) {
          parent.registerBinding('var', name, decl);
        }
      }
    }
  },

  Declaration(node, state) {
    if (isBlockScoped(node)) return;
    if (isImportDeclaration(node)) return;
    if (isExportDeclaration(node)) return;
    const scope = state.scopes.get(node);
    const parent =
      state.getFunctionParent(scope) || state.getProgramParent(scope);
    parent.registerDeclaration(node);
  },

  BlockScoped(node, state) {
    let scope = state.scopes.get(node);
    if (scope.node === node) scope = scope.parent;
    const parent = state.getBlockParent(scope);
    parent.registerDeclaration(node);
  },

  ImportDeclaration(node, state) {
    const scope = state.scopes.get(node);
    const parent = state.getBlockParent(scope);
    parent.registerDeclaration(node);
  },

  Identifier(node, state, ancestors) {
    if (state.isReferenced(ancestors)) {
      state.defer.references.add(() => {
        const scope = state.scopes.get(node);
        const ids = state.getBindingIdentifiers(node);
        return { scope, ids, type: 'identifier' };
      });
    }
  },

  ForXStatement(node, state) {
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
      parentScope.registerBinding('var', left.name, left);
    }
  },

  // `acorn` Identifier 没有算上 ExportNamedDeclaration 中的值
  ExportNamedDeclaration(node, state) {
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

  ExportDeclaration(node, state) {
    if (isExportAllDeclaration(node)) return;
    const { declarations } = node;
    const scope = state.scopes.get(node);
    if (
      isClassDeclaration(declarations) ||
      isFunctionDeclaration(declarations)
    ) {
      const { id } = declarations;
      if (!id) return;
      const ids = state.getBindingIdentifiers(id);
      state.defer.references.add(() => {
        return { ids, type: 'export' };
      });
    } else if (isVariableDeclaration(declarations)) {
      for (const decl of declarations) {
        state.defer.references.add(() => {
          const ids = state.getBindingIdentifiers(decl.id);
          return { scope, ids, type: 'export' };
        });
      }
    }
  },

  LabeledStatement(node, state) {
    const scope = state.scopes.get(node);
    const parent = state.getBlockParent(scope);
    parent.registerDeclaration(node);
  },

  AssignmentExpression(node, state) {
    state.defer.assignments.add(() => {
      const scope = state.scopes.get(node);
      return { scope, ids: state.getBindingIdentifiers(node.left) };
    });
  },

  UpdateExpression(node, state) {
    state.defer.constantViolations.add(() => {
      const scope = state.scopes.get(node);
      return { scope, node: node.argument };
    });
  },

  UnaryExpression(node, state) {
    if (node.operator === 'delete') {
      state.defer.constantViolations.add(() => {
        const scope = state.scopes.get(node);
        return { scope, node: node.argument };
      });
    }
  },

  CatchClause(node, state) {
    const scope = state.scopes.get(node);
    const ids = state.getBindingIdentifiers(node.param);
    for (const { name } of ids) {
      scope.registerBinding('let', name, node);
    }
  },

  Function(node, state) {
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
      scope.registerBinding('local', id.name, node);
    }
  },

  ClassExpression(node, state) {
    const { id } = node;
    const scope = state.scopes.get(node);
    if (id) {
      scope.registerBinding('local', id.name, node);
    }
  },
};
