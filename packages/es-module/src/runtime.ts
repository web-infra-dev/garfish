import { transformUrl } from '@garfish/utils';
import { Output, Compiler } from './compiler/index';
import {
  Module,
  NamespaceModule,
  createImportMeta,
  createNamespaceModule,
} from './module';

export type ModuleOutput = Output & {
  storeId: string;
  realUrl: string;
  exports: Array<string>;
};

export const runtime = {
  store: {
    namespace: new WeakMap<Module, NamespaceModule>(),
    modules: Object.create(null) as Record<string, Module>,
    resources: Object.create(null) as Record<
      string,
      ModuleOutput | Promise<void>
    >,
  },

  // atob 对中文不友好
  toBase64(input: string) {
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(new Blob([input]));
      reader.onload = () => resolve(reader.result as string);
    });
  },

  exportModule(module: Module, exportObject: Record<string, () => any>) {
    Object.keys(exportObject).forEach((key) => {
      Object.defineProperty(module, key, {
        enumerable: true,
        get: exportObject[key],
        set: () => {
          throw new TypeError('Assignment to constant variable.');
        },
      });
    });
  },

  importModule(storeId: string, moduleId: string) {
    if (!this.store.modules[storeId]) {
      const output = this.store.resources[storeId] as ModuleOutput;
      if (!output) {
        throw new Error(`Module '${moduleId}' not found`);
      }
      const module = (this.store.modules[storeId] = {});
      this.execCode(output, module);
    }
    return this.store.modules[storeId];
  },

  async dynamicImportModule(parentOutput: ModuleOutput, moduleId: string) {
    const storeId = transformUrl(parentOutput.storeId, moduleId);
    if (!this.store.modules[storeId]) {
      const requestUrl = transformUrl(parentOutput.realUrl, moduleId);
      await this.compileAndFetchCode(storeId, requestUrl);
      const currentOutput = this.store.resources[storeId] as ModuleOutput;
      const module = (this.store.modules[storeId] = {});
      this.execCode(currentOutput, module);
    }
    return this.getModuleNamespace(this.store.modules[storeId]);
  },

  getModuleNamespace(module: Module) {
    if (this.store.namespace.has(module)) {
      return this.store.namespace.get(module);
    }
    const wrapperModule = createNamespaceModule(module);
    this.store.namespace.set(module, wrapperModule);
    return wrapperModule;
  },

  execCode(output: ModuleOutput, module: Module) {
    const sourcemap = `\n//@ sourceMappingURL=${output.map}`;
    const importMeta = createImportMeta(output.realUrl);
    (0, eval)(`${output.code}\n//${output.storeId}${sourcemap}`);
    const actuator = globalThis[Compiler.keys.__VIRTUAL_WRAPPER__];

    actuator(
      (moduleId: string) => {
        const currentStoreId = transformUrl(output.storeId, moduleId);
        return this.importModule(currentStoreId, moduleId);
      },
      (exportObject: Record<string, () => any>) => {
        return this.exportModule(module, exportObject);
      },
      (module: Module) => this.getModuleNamespace(module),
      importMeta,
      (moduleId: string) => {
        return this.dynamicImportModule(output, moduleId);
      },
    );
  },

  compileAndFetchCode(storeId: string, url: string) {
    if (this.store.resources[storeId]) {
      return this.store.resources[storeId];
    }
    const p = fetch(url)
      .then(async (res) => {
        const code = res.status >= 400 ? '' : await res.text();
        return [code, res.url]; // 可能重定向了
      })
      .then(async ([code, realUrl]) => {
        if (code) {
          const compiler = new Compiler({
            code,
            storeId,
            filename: storeId,
          });
          const { imports, exports, generateCode } = compiler.transform();
          await Promise.all(
            imports.map(({ moduleId }) => {
              const curStoreId = transformUrl(storeId, moduleId);
              const requestUrl = transformUrl(realUrl, moduleId);
              return this.store.resources[curStoreId]
                ? null
                : this.compileAndFetchCode(curStoreId, requestUrl);
            }),
          );

          const output = generateCode() as ModuleOutput;
          output.storeId = storeId;
          output.realUrl = realUrl;
          output.exports = exports;
          output.map = await this.toBase64(output.map);
          this.store.resources[storeId] = output;
        } else {
          this.store.resources[storeId] = null;
        }
      });
    this.store.resources[storeId] = p;
    return p;
  },
};
