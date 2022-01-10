import { Compiler } from './compiler/index';
import { createImportMeta, createNamespaceModule } from './module';

export const runtime = {
  store: {
    namespace: new WeakMap(),
    modules: Object.create(null),
    resources: Object.create(null),
  },

  // atob 对中文不友好
  toBase64(input) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(new Blob([input]));
    });
  },

  transformUrl(resolvePath, curPath) {
    const baseUrl = new URL(resolvePath, location.href);
    const realPath = new URL(curPath, baseUrl.href);
    return realPath.href;
  },

  exportModule(module, exportObject) {
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

  importModule(storeId, moduleId) {
    if (!this.store.modules[storeId]) {
      const output = this.store.resources[storeId];
      if (!output) {
        throw new Error(`Module '${moduleId}' not found`);
      }
      const module = (this.store.modules[storeId] = {});
      this.execCode(output, module);
    }
    return this.store.modules[storeId];
  },

  async dynamicImportModule(parentOutput, moduleId) {
    const storeId = this.transformUrl(parentOutput.storeId, moduleId);
    if (!this.store.modules[storeId]) {
      const requestUrl = this.transformUrl(parentOutput.realUrl, moduleId);
      await this.compileAndFetchCode(storeId, requestUrl);
      const currentOutput = this.store.resources[storeId];
      const module = (this.store.modules[storeId] = {});
      this.execCode(currentOutput, module);
    }
    return this.getModuleNamespace(this.store.modules[storeId]);
  },

  getModuleNamespace(module) {
    if (this.store.namespace.has(module)) {
      return this.store.namespace.get(module);
    }
    const wrapperModule = createNamespaceModule(module);
    this.store.namespace.set(module, wrapperModule);
    return wrapperModule;
  },

  execCode(output, module) {
    const sourcemap = `\n//@ sourceMappingURL=${output.map}`;
    (0, eval)(`${output.code}\n//${output.storeId}${sourcemap}`);
    const importMeta = createImportMeta(output.realUrl);
    const namespace = (module) => this.getModuleNamespace(module);
    const _export = (exportObject) => this.exportModule(module, exportObject);
    const _import = (moduleId) => {
      const currentStoreId = this.transformUrl(output.storeId, moduleId);
      return this.importModule(currentStoreId, moduleId);
    };
    const dynamicImport = (moduleId) => {
      return this.dynamicImportModule(output, moduleId);
    };

    const actuator = globalThis[Compiler.keys.__VIRTUAL_WRAPPER__];
    actuator(_import, _export, namespace, importMeta, dynamicImport);
  },

  compileAndFetchCode(storeId, url) {
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
              const curStoreId = this.transformUrl(storeId, moduleId);
              const requestUrl = this.transformUrl(realUrl, moduleId);
              return this.store.resources[curStoreId]
                ? null
                : this.compileAndFetchCode(curStoreId, requestUrl);
            }),
          );

          const output = generateCode();
          output.storeId = storeId;
          output.realUrl = realUrl;
          output.exports = exports;
          output.map = await this.toBase64(output.map.toString());
          this.store.resources[storeId] = output;
        } else {
          this.store.resources[storeId] = null;
        }
      });
    this.store.resources[storeId] = p;
    return p;
  },
};
