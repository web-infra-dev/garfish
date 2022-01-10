import { Parser } from 'acorn';
import { ancestor } from 'acorn-walk';
import { generate } from 'escodegen';
import { transformUrl } from '@garfish/utils';
import type {
  Node,
  Program,
  Statement,
  Identifier,
  Expression,
  MetaProperty,
  CallExpression,
  MemberExpression,
  VariableDeclaration,
  ExportDefaultDeclaration,
  ImportSpecifier,
  ImportDeclaration,
  ExportAllDeclaration,
  ExportNamedDeclaration,
  ImportExpression,
} from 'estree';
import type { Scope } from './scope';
import { State, createState } from './state';
import { runtime, ModuleOutput } from '../runtime';
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

export interface Output {
  map: string;
  code: string;
}

type ImportInfoData = (
  | ReturnType<Compiler['getImportInformation']>
  | ReturnType<Compiler['getImportInformationBySource']>
) & {
  moduleName: string;
};
type ImportTransformNode = ReturnType<Compiler['generateImportTransformNode']>;

interface CompilerOptions {
  code: string;
  storeId: string;
  filename: string;
}

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

  private ast: Program;
  private opts: CompilerOptions;
  private state: ReturnType<typeof createState>;

  private moduleCount = 0;
  private consumed = false;
  private importInfos: Array<{
    data: ImportInfoData;
    transformNode: ImportTransformNode;
  }> = [];
  private exportInfos: Array<{
    name: string;
    refNode: Identifier | CallExpression | MemberExpression;
  }> = [];
  private deferQueue = {
    removes: new Set<() => void>(),
    replaces: new Set<() => void>(),
    importChecks: new Set<() => void>(),
    identifierRefs: new Set<() => void>(),
    exportNamespaces: new Set<{
      moduleId: string;
      namespace: string | undefined;
      fn: (names: Array<string>) => void;
    }>(),
  };

  constructor(opts: CompilerOptions) {
    this.opts = opts;
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
      return parser.parse() as unknown as Program;
    } catch (e) {
      e.message += `(${this.opts.filename})`;
      throw e;
    }
  }

  checkImportNames(imports: ImportInfoData['imports'], moduleId: string) {
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

  getChildModuleExports(moduleId: string) {
    const storeId = transformUrl(this.opts.storeId, moduleId);
    const output = runtime.store.resources[storeId] as ModuleOutput;
    return output ? output.exports : null;
  }

  getImportInformation(node: ImportDeclaration) {
    const imports = node.specifiers.map((n) => {
      const isDefault = isImportDefaultSpecifier(n);
      const isNamespace = isImportNamespaceSpecifier(n);
      const isSpecial = isDefault || isNamespace;
      const alias = isSpecial ? null : n.local.name;
      const name = isSpecial
        ? n.local.name
        : (n as ImportSpecifier).imported.name;
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
      moduleId: node.source.value as string,
    };
  }

  getImportInformationBySource(
    node: ExportNamedDeclaration | ExportAllDeclaration,
  ) {
    const imports = ((node as ExportNamedDeclaration).specifiers || []).map(
      (n) => {
        const alias = n.exported.name;
        const name = n.local.name;
        return {
          name,
          alias: alias === name ? null : alias,
        };
      },
    );

    return {
      imports,
      isExport: true,
      moduleId: node.source.value as string,
    };
  }

  generateImportTransformNode(moduleName: string, moduleId: string) {
    const varName = identifier(moduleName);
    const varExpr = callExpression(
      identifier(Compiler.keys.__VIRTUAL_IMPORT__),
      [literal(moduleId)],
    );
    const varNode = variableDeclarator(varName, varExpr);
    return variableDeclaration('const', [varNode]);
  }

  generateIdentifierTransformNode(
    nameOrInfo: string | ReturnType<Compiler['findIndexInData']>,
  ) {
    let info;
    if (typeof nameOrInfo === 'string') {
      for (const { data } of this.importInfos) {
        if (!data.isExport) {
          const result = this.findIndexInData(nameOrInfo, data);
          if (result) {
            info = result;
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
      exportCallExpression as any,
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
        // 此时的节点已经转换了，不再是 Program 类型
        blockStatement([directive, ...(this.ast.body as Array<Statement>)]),
      ),
    ];
  }

  findIndexInData(refName: string, data: ImportInfoData) {
    for (let i = 0; i < data.imports.length; i++) {
      const { name, alias } = data.imports[i];
      if (refName === alias || refName === name) {
        return { i, data };
      }
    }
  }

  findImportInfo(moduleId: string): [string?, VariableDeclaration?] {
    for (const { data, transformNode } of this.importInfos) {
      if (data.moduleId === moduleId) {
        return [data.moduleName, transformNode];
      }
    }
    return [];
  }

  isReferencedModuleVariable(scope: Scope, node: Identifier) {
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
  processExportSpecifiers(
    node: ExportNamedDeclaration,
    state: State,
    ancestors: Array<Node>,
  ) {
    if (node.source) {
      const moduleId = node.source.value as string;
      const data = this.getImportInformationBySource(node);
      let [moduleName, transformNode] = this.findImportInfo(moduleId);

      if (!moduleName) {
        moduleName = `__m${this.moduleCount++}__`;
        transformNode = this.generateImportTransformNode(moduleName, moduleId);
      }

      (data as ImportInfoData).moduleName = moduleName;
      this.importInfos.push({ data: data as ImportInfoData, transformNode });
      this.deferQueue.importChecks.add(() =>
        this.checkImportNames(data.imports, moduleId),
      );

      node.specifiers.forEach((n) => {
        const useInfo = this.findIndexInData(
          n.local.name,
          data as ImportInfoData,
        );
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
  processExportNamedDeclaration(
    node: ExportNamedDeclaration | ExportDefaultDeclaration,
    state: State,
    ancestors: Array<Node>,
  ) {
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
        const varNode = variableDeclarator(
          varName,
          node.declaration as Expression,
        );
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
  processExportAllDeclaration(
    node: ExportAllDeclaration,
    state: State,
    ancestors: Array<Node>,
  ) {
    const moduleId = node.source.value as string;
    const data = this.getImportInformationBySource(node);
    const namespace = node.exported && node.exported.name;
    let [moduleName, transformNode] = this.findImportInfo(moduleId);

    if (!moduleName) {
      moduleName = `__m${this.moduleCount++}__`;
      transformNode = this.generateImportTransformNode(moduleName, moduleId);
    }

    (data as ImportInfoData).moduleName = moduleName;
    this.importInfos.push({ data: data as ImportInfoData, transformNode });

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
  exportDeclarationVisitor(node: any, state: State, ancestors: Array<Node>) {
    if (node.declaration) {
      this.processExportNamedDeclaration(node, state, [...ancestors]);
    } else if (node.specifiers) {
      this.processExportSpecifiers(node, state, [...ancestors]);
    } else if (isExportAllDeclaration(node)) {
      this.processExportAllDeclaration(node, state, [...ancestors]);
    }
  }

  // 处理所有用到 esm 的引用
  identifierVisitor(node: Identifier, state: State, ancestors: Array<Node>) {
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
  importDeclarationVisitor(
    node: ImportDeclaration,
    state: State,
    ancestors: Array<Node>,
  ) {
    ancestors = [...ancestors];
    const moduleId = node.source.value as string;
    const data = this.getImportInformation(node);
    let [moduleName, transformNode] = this.findImportInfo(moduleId);

    if (!moduleName) {
      moduleName = `__m${this.moduleCount++}__`;
      transformNode = this.generateImportTransformNode(moduleName, moduleId);
    }

    (data as ImportInfoData).moduleName = moduleName;
    this.importInfos.push({ data: data as ImportInfoData, transformNode });

    this.deferQueue.removes.add(() => state.remove(ancestors));
    this.deferQueue.importChecks.add(() =>
      this.checkImportNames(data.imports, moduleId),
    );
  }

  // Dynamic import expression
  importExpressionVisitor(
    node: ImportExpression,
    state: State,
    ancestors: Array<Node>,
  ) {
    const replacement = callExpression(
      identifier(Compiler.keys.__VIRTUAL_DYNAMIC_IMPORT__),
      [node.source],
    );
    state.replaceWith(replacement, ancestors);
  }

  // `import.meta`
  importMetaVisitor(node: MetaProperty, state: State, ancestors: Array<Node>) {
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
        ? [namespace as string]
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

    const output = generate(this.ast, {
      sourceMapWithCode: true,
      sourceMap: this.opts.filename,
      sourceContent: this.opts.code,
    }) as unknown as Output;

    output.map = output.map.toString();
    return output;
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
      this.ast as any,
      {
        Identifier: pack(this.identifierVisitor),
        // `let x = 1` 和 `x = 2` acorn 给单独区分出来了
        VariablePattern: pack(this.identifierVisitor),
        MetaProperty: pack(this.importMetaVisitor),
        ImportDeclaration: pack(this.importDeclarationVisitor),
        ImportExpression: pack(this.importExpressionVisitor),
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
