import {
  toBase64,
  deepMerge,
  transformUrl,
  isPlainObject,
} from '@garfish/utils';
import { Loader, JavaScriptManager } from '@garfish/loader';
import { Output, Compiler } from './compiler';
import { Module, MemoryModule, createModule, createImportMeta } from './module';

export type ModuleOutput = Output & {
  storeId: string;
  realUrl: string;
  exports: Array<string>;
};

export interface RuntimeOptions {
  scope: string;
  loader: Loader;
}

export class Runtime {
  private options: RuntimeOptions;
  private modules = new WeakMap<MemoryModule, Module>();
  private memoryModules: Record<string, MemoryModule> = {};
  public resources: Record<string, ModuleOutput | Promise<void>> = {};

  constructor(options?: RuntimeOptions) {
    const defaultOptions = {
      scope: 'default',
      loader: new Loader(),
    };
    this.options = isPlainObject(options)
      ? deepMerge(defaultOptions, options)
      : defaultOptions;
  }

  private getModule(memoryModule: MemoryModule) {
    if (!this.modules.has(memoryModule)) {
      this.modules.set(memoryModule, createModule(memoryModule));
    }
    return this.modules.get(memoryModule);
  }

  private execCode(output: ModuleOutput, memoryModule: MemoryModule) {
    const sourcemap = `\n//@ sourceMappingURL=${output.map}`;
    (0, eval)(`${output.code}\n//${output.storeId}${sourcemap}`);
    const actuator = globalThis[Compiler.keys.__VIRTUAL_WRAPPER__];

    actuator(
      createImportMeta(output.realUrl),

      (memoryModule: MemoryModule) => {
        return this.getModule(memoryModule);
      },

      (moduleId: string) => {
        const storeId = transformUrl(output.storeId, moduleId);
        const requestUrl = transformUrl(output.realUrl, moduleId);
        return this.dynamicImportMemoryModule(storeId, requestUrl);
      },

      (moduleId: string) => {
        const storeId = transformUrl(output.storeId, moduleId);
        return this.importMemoryModule(storeId);
      },

      (exportObject: Record<string, () => any>) => {
        Object.keys(exportObject).forEach((key) => {
          Object.defineProperty(memoryModule, key, {
            enumerable: true,
            get: exportObject[key],
            set: () => {
              throw new TypeError('Assignment to constant variable.');
            },
          });
        });
      },
    );
  }

  private compileAndFetchCode(storeId: string, url: string) {
    if (this.resources[storeId]) {
      return this.resources[storeId];
    }
    const { loader, scope } = this.options;
    const p = loader
      .load<JavaScriptManager>(scope, url)
      .then(async ({ resourceManager }) => {
        const { url, scriptCode } = resourceManager;

        if (scriptCode) {
          const compiler = new Compiler({
            storeId,
            runtime: this,
            code: scriptCode,
            filename: storeId,
          });

          const { imports, exports, generateCode } = compiler.transform();
          await Promise.all(
            imports.map(({ moduleId }) => {
              const curStoreId = transformUrl(storeId, moduleId);
              const requestUrl = transformUrl(url, moduleId);
              return this.resources[curStoreId]
                ? null
                : this.compileAndFetchCode(curStoreId, requestUrl);
            }),
          );

          const output = generateCode() as ModuleOutput;
          output.storeId = storeId;
          output.realUrl = url;
          output.exports = exports;
          output.map = await toBase64(output.map);
          this.resources[storeId] = output;
        } else {
          this.resources[storeId] = null;
        }
      });
    this.resources[storeId] = p;
    return p;
  }

  importMemoryModule(storeId: string) {
    let memoryModule = this.memoryModules[storeId];
    if (!memoryModule) {
      const output = this.resources[storeId] as ModuleOutput;
      if (!output) {
        throw new Error(`Module '${storeId}' not found`);
      }
      memoryModule = this.memoryModules[storeId] = {};
      this.execCode(output, memoryModule);
    }
    return memoryModule;
  }

  async dynamicImportMemoryModule(storeId: string, requestUrl: string) {
    let memoryModule = this.memoryModules[storeId];
    if (!memoryModule) {
      await this.compileAndFetchCode(storeId, requestUrl);
      const output = this.resources[storeId] as ModuleOutput;
      if (!output) {
        throw new Error(`Module '${storeId}' not found`);
      }
      memoryModule = this.memoryModules[storeId] = {};
      this.execCode(output, memoryModule);
    }
    return this.getModule(memoryModule);
  }
}

export const runtime = new Runtime();
