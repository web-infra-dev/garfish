import { transformUrl } from '@garfish/utils';
import { Output, Compiler } from './compiler/index';
import { Module, MemoryModule, createModule, createImportMeta } from './module';

export type ModuleOutput = Output & {
  storeId: string;
  realUrl: string;
  exports: Array<string>;
};

class Runtime {
  private modules = new WeakMap<MemoryModule, Module>();
  private memoryModules: Record<string, MemoryModule> = {};
  public resources: Record<string, ModuleOutput | Promise<void>> = {};

  private toBase64(input: string) {
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(new Blob([input]));
      reader.onload = () => resolve(reader.result as string);
    });
  }

  private exportModule(
    memoryModule: MemoryModule,
    exportObject: Record<string, () => any>,
  ) {
    Object.keys(exportObject).forEach((key) => {
      Object.defineProperty(memoryModule, key, {
        enumerable: true,
        get: exportObject[key],
        set: () => {
          throw new TypeError('Assignment to constant variable.');
        },
      });
    });
  }

  private importModule(storeId: string, moduleId: string) {
    if (!this.memoryModules[storeId]) {
      const output = this.resources[storeId] as ModuleOutput;
      if (!output) {
        throw new Error(`Module '${moduleId}' not found`);
      }
      const module = (this.memoryModules[storeId] = {});
      this.execCode(output, module);
    }
    return this.memoryModules[storeId];
  }

  private async dynamicImportModule(
    parentOutput: ModuleOutput,
    moduleId: string,
  ) {
    const storeId = transformUrl(parentOutput.storeId, moduleId);
    if (!this.memoryModules[storeId]) {
      const requestUrl = transformUrl(parentOutput.realUrl, moduleId);
      await this.compileAndFetchCode(storeId, requestUrl);
      const currentOutput = this.resources[storeId] as ModuleOutput;
      const module = (this.memoryModules[storeId] = {});
      this.execCode(currentOutput, module);
    }
    return this.getModuleNamespace(this.memoryModules[storeId]);
  }

  private getModuleNamespace(memoryModule: MemoryModule) {
    if (this.modules.has(memoryModule)) {
      return this.modules.get(memoryModule);
    }
    const wrapperModule = createModule(memoryModule);
    this.modules.set(memoryModule, wrapperModule);
    return wrapperModule;
  }

  execCode(output: ModuleOutput, memoryModule: MemoryModule) {
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
        return this.exportModule(memoryModule, exportObject);
      },
      (memoryModule: MemoryModule) => this.getModuleNamespace(memoryModule),
      importMeta,
      (moduleId: string) => {
        return this.dynamicImportModule(output, moduleId);
      },
    );
  }

  compileAndFetchCode(storeId: string, url: string) {
    if (this.resources[storeId]) {
      return this.resources[storeId];
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
              return this.resources[curStoreId]
                ? null
                : this.compileAndFetchCode(curStoreId, requestUrl);
            }),
          );

          const output = generateCode() as ModuleOutput;
          output.storeId = storeId;
          output.realUrl = realUrl;
          output.exports = exports;
          output.map = await this.toBase64(output.map);
          this.resources[storeId] = output;
        } else {
          this.resources[storeId] = null;
        }
      });
    this.resources[storeId] = p;
    return p;
  }
}

export const runtime = new Runtime();
