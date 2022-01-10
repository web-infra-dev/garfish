import { Parser } from 'acorn';
import { ancestor } from 'acorn-walk';
import { generate } from 'escodegen';
import { runtime } from '../runtime';
import { createState } from './state';
import {
  isIdentifier,
  isVariableDeclaration,
  isExportSpecifier,
  isExportAllDeclaration,
  isExportDefaultDeclaration,
  isImportDefaultSpecifier,
  isImportNamespaceSpecifier,
} from './types';
import {
  literal,
  identifier,
  callExpression,
  objectProperty,
  blockStatement,
  objectExpression,
  memberExpression,
  variableDeclarator,
  variableDeclaration,
  expressionStatement,
  functionDeclaration,
  arrowFunctionExpression,
} from './generated';

export class Compiler {
  static keys = {
    __VIRTUAL_IMPORT__: '__VIRTUAL_IMPORT__',
    __VIRTUAL_EXPORT__: '__VIRTUAL_EXPORT__',
    __VIRTUAL_DEFAULT__: '__VIRTUAL_DEFAULT__',
    __VIRTUAL_WRAPPER__: '__VIRTUAL_WRAPPER__',
    __VIRTUAL_NAMESPACE__: '__VIRTUAL_NAMESPACE__',
    __VIRTUAL_IMPORT_META__: '__VIRTUAL_IMPORT_META__',
    __VIRTUAL_DYNAMIC_IMPORT__: '__VIRTUAL_DYNAMIC_IMPORT__',
  };

  constructor(opts) {
    this.opts = opts;
    this.moduleCount = 0;
    this.importInfos = [];
    this.exportInfos = [];
    this.deferQueue = {
      removes: new Set(),
      replaces: new Set(),
      importChecks: new Set(),
      identifierRefs: new Set(),
      exportNamespaces: new Set(),
    };
    this.consumed = false;
    this.ast = this.parse();
    this.state = createState(this.ast);
  }

  parse() {
    const parser = new Parser(
      {
        locations: true,
        sourceType: 'module',
        ecmaVersion: 'latest',
        sourceFile: this.opts.filename,
      },
      this.opts.code,
    );
    try {
      return parser.parse();
    } catch (e) {
      e.message += `(${this.opts.filename})`;
      throw e;
    }
  }

  checkImportNames(imports, moduleId) {
    const exports = this.getChildModuleExports(moduleId);
    if (exports) {
      imports.forEach((item) => {
        if (item.isNamespace) return;
        const checkName = item.isDefault ? 'default' : item.name;
        if (!exports.includes(checkName)) {
          throw SyntaxError(
            `(${this.opts.filename}): The module '${moduleId}' does not provide an export named '${checkName}'`,
          );
        }
      });
    }
  }

  getChildModuleExports(moduleId) {
    const storeId = runtime.transformUrl(this.opts.storeId, moduleId);
    const output = runtime.store.resources[storeId];
    return output ? output.exports : null;
  }

  getImportInformation(node) {
    const imports = node.specifiers.map((n) => {
      const isDefault = isImportDefaultSpecifier(n);
      const isNamespace = isImportNamespaceSpecifier(n);
      const isSpecial = isDefault || isNamespace;
      const alias = isSpecial ? null : n.local.name;
      const name = isSpecial ? n.local.name : n.imported.name;
      return {
        name,
        isDefault,
        isNamespace,
        alias: alias === name ? null : alias,
      };
    });
    return {
      imports,
      isExport: false,
      moduleId: node.source.value,
    };
  }

  getImportInformationBySource(node) {
    const imports = (node.specifiers || []).map((n) => {
      const alias = n.exported.name;
      const name = n.local.name;
      return {
        name,
        alias: alias === name ? null : alias,
      };
    });
    return {
      imports,
      isExport: true,
      moduleId: node.source.value,
    };
  }

  generateImportTransformNode(moduleName, moduleId) {
    const varName = identifier(moduleName);
    const varExpr = callExpression(
      identifier(Compiler.keys.__VIRTUAL_IMPORT__),
      [literal(moduleId)],
    );
    const varNode = variableDeclarator(varName, varExpr);
    return variableDeclaration('const', [varNode]);
  }

  generateIdentifierTransformNode(nameOrInfo) {
    let info;
    if (typeof nameOrInfo === 'string') {
      for (const { data, isExport } of this.importInfos) {
        if (!isExport) {
          const res = this.findIndexInData(nameOrInfo, data);
          if (res) {
            info = res;
            break;
          }
        }
      }
    } else {
      info = nameOrInfo;
    }

    if (info && info.data) {
      const { i, data } = info;
      const item = data.imports[i];
      if (item.isNamespace) {
        return callExpression(identifier(Compiler.keys.__VIRTUAL_NAMESPACE__), [
          identifier(data.moduleName),
        ]);
      } else {
        const propName = item.isDefault ? 'default' : item.name;
        return memberExpression(
          identifier(data.moduleName),
          identifier(propName),
        );
      }
    }
  }

  generateVirtualModuleSystem() {
    const exportNodes = this.exportInfos.map(({ name, refNode }) => {
      return objectProperty(
        identifier(name),
        arrowFunctionExpression([], refNode),
      );
    });
    const exportCallExpression = callExpression(
      identifier(Compiler.keys.__VIRTUAL_EXPORT__),
      [objectExpression(exportNodes)],
    );
    this.ast.body.unshift(
      exportCallExpression,
      ...new Set(this.importInfos.map((val) => val.transformNode)),
    );
  }

  generateWrapperFunction() {
    const params = [
      Compiler.keys.__VIRTUAL_IMPORT__,
      Compiler.keys.__VIRTUAL_EXPORT__,
      Compiler.keys.__VIRTUAL_NAMESPACE__,
      Compiler.keys.__VIRTUAL_IMPORT_META__,
      Compiler.keys.__VIRTUAL_DYNAMIC_IMPORT__,
    ].map((key) => identifier(key));
    const id = identifier(Compiler.keys.__VIRTUAL_WRAPPER__);
    const directive = expressionStatement(literal('use strict'), 'use strict');
    this.ast.body = [
      functionDeclaration(
        id,
        params,
        blockStatement([directive, ...this.ast.body]),
      ),
    ];
  }

  findIndexInData(refName, data) {
    for (let i = 0; i < data.imports.length; i++) {
      const { name, alias } = data.imports[i];
      if (refName === alias || refName === name) {
        return { i, data };
      }
    }
  }

  findImportInfo(moduleId) {
    for (const info of this.importInfos) {
      if (info.data.moduleId === moduleId) {
        return [info.data.moduleName, info.transformNode];
      }
    }
    return [];
  }

  isReferencedModuleVariable(scope, node) {
    const u = () =>
      Object.keys(scope.bindings).some((key) => {
        const { kind, references, constantViolations } = scope.bindings[key];
        if (kind === 'module') {
          return references.has(node) || constantViolations.has(node);
        }
      });
    while (scope) {
      if (u()) return true;
      scope = scope.parent;
    }
    return false;
  }

  // 1. export { a as default };
  // 2. export { default as x } from 'module';
  processExportSpecifiers(node, state, ancestors) {
    if (node.source) {
      const moduleId = node.source.value;
      const data = this.getImportInformationBySource(node);
      let [moduleName, transformNode] = this.findImportInfo(moduleId);

      if (!moduleName) {
        moduleName = `__m${this.moduleCount++}__`;
        transformNode = this.generateImportTransformNode(moduleName, moduleId);
      }
      data.moduleName = moduleName;
      this.importInfos.push({ data, transformNode });
      this.deferQueue.importChecks.add(() =>
        this.checkImportNames(data.imports, moduleId),
      );
      node.specifiers.forEach((n) => {
        const useInfo = this.findIndexInData(n.local.name, data);
        const refNode = this.generateIdentifierTransformNode(useInfo);
        this.exportInfos.push({ refNode, name: n.exported.name });
      });
    } else {
      const scope = state.getScopeByAncestors(ancestors);
      node.specifiers.forEach((n) => {
        const refNode = this.isReferencedModuleVariable(scope, n.local)
          ? this.generateIdentifierTransformNode(n.local.name)
          : identifier(n.local.name);
        this.exportInfos.push({ refNode, name: n.exported.name });
      });
    }
    this.deferQueue.removes.add(() => state.remove(ancestors));
  }

  // 1. export default 1;
  // 2. export const a = 1;
  processExportNamedDeclaration(node, state, ancestors) {
    const isDefault = isExportDefaultDeclaration(node);
    const nodes = isVariableDeclaration(node.declaration)
      ? node.declaration.declarations
      : [node.declaration];

    nodes.forEach((node) => {
      let name, refNode;
      if (isDefault) {
        name = 'default';
        refNode = identifier(Compiler.keys.__VIRTUAL_DEFAULT__);
      } else {
        name = isIdentifier(node) ? node.name : node.id.name;
        refNode = identifier(name);
      }
      this.exportInfos.push({ name, refNode });
    });

    if (isDefault) {
      this.deferQueue.replaces.add(() => {
        // 此时 declaration 可能已经被替换过了
        const varName = identifier(Compiler.keys.__VIRTUAL_DEFAULT__);
        const varNode = variableDeclarator(varName, node.declaration);
        state.replaceWith(variableDeclaration('const', [varNode]), ancestors);
      });
    } else if (isIdentifier(node.declaration)) {
      this.deferQueue.removes.add(() => state.remove(ancestors));
    } else {
      this.deferQueue.replaces.add(() => {
        state.replaceWith(node.declaration, ancestors);
      });
    }
  }

  // 1. export * from 'module';
  // 2. export * as x from 'module';
  processExportAllDeclaration(node, state, ancestors) {
    const moduleId = node.source.value;
    const data = this.getImportInformationBySource(node);
    const namespace = node.exported && node.exported.name;
    let [moduleName, transformNode] = this.findImportInfo(moduleId);

    if (!moduleName) {
      moduleName = `__m${this.moduleCount++}__`;
      transformNode = this.generateImportTransformNode(moduleName, moduleId);
    }
    data.moduleName = moduleName;
    this.importInfos.push({ data, transformNode });
    this.deferQueue.removes.add(() => state.remove(ancestors));
    this.deferQueue.exportNamespaces.add({
      moduleId,
      namespace,
      fn: (names) => {
        names.forEach((name) => {
          let refNode;
          if (name === namespace) {
            refNode = callExpression(
              identifier(Compiler.keys.__VIRTUAL_NAMESPACE__),
              [identifier(moduleName)],
            );
          } else {
            refNode = memberExpression(
              identifier(moduleName),
              identifier(name),
            );
          }
          this.exportInfos.push({ refNode, name });
        });
      },
    });
  }

  // 处理所有的 export
  exportDeclarationVisitor(node, state, ancestors) {
    if (node.declaration) {
      this.processExportNamedDeclaration(node, state, [...ancestors]);
    } else if (node.specifiers) {
      this.processExportSpecifiers(node, state, [...ancestors]);
    } else if (isExportAllDeclaration(node)) {
      this.processExportAllDeclaration(node, state, [...ancestors]);
    }
  }

  // 处理所有用到 esm 的引用
  identifierVisitor(node, state, ancestors) {
    const parent = ancestors[ancestors.length - 2];
    if (isExportSpecifier(parent)) return;
    const scope = state.getScopeByAncestors(ancestors);

    if (this.isReferencedModuleVariable(scope, node)) {
      ancestors = [...ancestors];
      this.deferQueue.identifierRefs.add(() => {
        const replacement = this.generateIdentifierTransformNode(node.name);
        if (replacement) {
          state.replaceWith(replacement, ancestors);
        }
      });
    }
  }

  // Static import expression
  importDeclarationVisitor(node, state, ancestors) {
    ancestors = [...ancestors];
    const moduleId = node.source.value;
    const data = this.getImportInformation(node);
    let [moduleName, transformNode] = this.findImportInfo(moduleId);

    if (!moduleName) {
      moduleName = `__m${this.moduleCount++}__`;
      transformNode = this.generateImportTransformNode(moduleName, moduleId);
    }
    data.moduleName = moduleName;
    this.importInfos.push({ data, transformNode });
    this.deferQueue.removes.add(() => state.remove(ancestors));
    this.deferQueue.importChecks.add(() =>
      this.checkImportNames(data.imports, moduleId),
    );
  }

  // Dynamic import expression
  importExpressionVisitor(node, state, ancestors) {
    const replacement = callExpression(
      identifier(Compiler.keys.__VIRTUAL_DYNAMIC_IMPORT__),
      [node.source],
    );
    state.replaceWith(replacement, ancestors);
  }

  // `import.meta`
  importMetaVisitor(node, state, ancestors) {
    if (node.meta.name === 'import') {
      const replacement = memberExpression(
        identifier(Compiler.keys.__VIRTUAL_IMPORT_META__),
        node.property,
      );
      state.replaceWith(replacement, ancestors);
    }
  }
  generateCode() {
    const nameCounts = {};
    const getExports = ({ namespace, moduleId }) => {
      return namespace
        ? [namespace]
        : this.getChildModuleExports(moduleId) || [];
    };

    this.deferQueue.exportNamespaces.forEach((val) => {
      getExports(val).forEach((name) => {
        if (!nameCounts[name]) {
          nameCounts[name] = 1;
        } else {
          nameCounts[name]++;
        }
      });
    });

    this.deferQueue.exportNamespaces.forEach((val) => {
      // `export namespace` 变量的去重
      const exports = getExports(val).filter((name) => {
        if (name === 'default') return false;
        if (nameCounts[name] > 1) return false;
        return this.exportInfos.every((val) => val.name !== name);
      });
      val.fn(exports);
    });

    this.deferQueue.importChecks.forEach((fn) => fn());
    this.deferQueue.identifierRefs.forEach((fn) => fn());
    this.deferQueue.replaces.forEach((fn) => fn());
    this.deferQueue.removes.forEach((fn) => fn());

    // 生成转换后的代码
    this.generateVirtualModuleSystem();
    this.generateWrapperFunction();

    return generate(this.ast, {
      sourceMapWithCode: true,
      sourceMap: this.opts.filename,
      sourceContent: this.opts.code,
    });
  }

  transform() {
    if (this.consumed) {
      throw new Error('Already consumed');
    }
    this.consumed = true;
    const that = this;
    const pack = (fn) => {
      return function () {
        fn.apply(that, arguments);
      };
    };

    ancestor(
      this.ast,
      {
        Identifier: pack(this.identifierVisitor),
        VariablePattern: pack(this.identifierVisitor), // `let x = 1` 和 `x = 2` acorn 给单独区分出来了
        // import.meta
        MetaProperty: pack(this.importMetaVisitor),
        // import
        ImportDeclaration: pack(this.importDeclarationVisitor),
        ImportExpression: pack(this.importExpressionVisitor),
        // export
        ExportAllDeclaration: pack(this.exportDeclarationVisitor),
        ExportNamedDeclaration: pack(this.exportDeclarationVisitor),
        ExportDefaultDeclaration: pack(this.exportDeclarationVisitor),
      },
      null,
      this.state,
    );

    return {
      generateCode: () => this.generateCode(),
      exports: this.exportInfos.map((v) => v.name),
      imports: this.importInfos.map((v) => v.data),
    };
  }
}
