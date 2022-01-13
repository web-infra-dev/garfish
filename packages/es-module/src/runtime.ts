import {
  toBase64,
  deepMerge,
  isPromise,
  isPlainObject,
  evalWithEnv,
  transformUrl,
} from '@garfish/utils';
import { Loader, LoaderOptions, JavaScriptManager } from '@garfish/loader';
import { Output, Compiler } from './compiler';
import { Module, MemoryModule, createModule, createImportMeta } from './module';

export type ModuleResource = Output & {
  storeId: string;
  realUrl: string;
  exports: Array<string>;
};

export interface RuntimeOptions {
  scope?: string;
  loaderOptions?: LoaderOptions;
  execCode?: (
    output: ModuleResource,
    provider: ReturnType<Runtime['generateProvider']>,
  ) => void;
}

export class Runtime {
  private modules = new WeakMap<MemoryModule, Module>();
  private memoryModules: Record<string, MemoryModule> = {};
  public loader: Loader;
  public options: RuntimeOptions;
  public resources: Record<string, ModuleResource | Promise<void>> = {};

  constructor(options?: RuntimeOptions) {
    const defaultOptions = {
      scope: 'default',
      loaderOptions: {},
    };
    this.options = isPlainObject(options)
      ? deepMerge(defaultOptions, options)
      : defaultOptions;
    this.loader = new Loader(this.options.loaderOptions);
  }

  private execCode(output: ModuleResource, memoryModule: MemoryModule) {
    const provider = this.generateProvider(output, memoryModule);

    if (this.options.execCode) {
      this.options.execCode(output, provider);
    } else {
      const sourcemap = `\n//@ sourceMappingURL=${output.map}`;
      const code = `${output.code}\n//${output.storeId}${sourcemap}`;
      evalWithEnv(code, provider, undefined, true);
    }
  }

  private importModule(
    storeId: string,
    requestUrl?: string,
  ): MemoryModule | Promise<MemoryModule> {
    let memoryModule = this.memoryModules[storeId];
    if (!memoryModule) {
      const get = () => {
        const output = this.resources[storeId] as ModuleResource;
        if (!output) {
          throw new Error(`Module '${storeId}' not found`);
        }
        memoryModule = this.memoryModules[storeId] = {};
        this.execCode(output, memoryModule);
        return memoryModule;
      };
      if (requestUrl) {
        const res = this.compileAndFetchCode(storeId, requestUrl);
        if (isPromise(res)) return res.then(() => get());
      }
      return get();
    }
    return memoryModule;
  }

  private getModule(memoryModule: MemoryModule) {
    if (!this.modules.has(memoryModule)) {
      this.modules.set(memoryModule, createModule(memoryModule));
    }
    return this.modules.get(memoryModule);
  }

  private generateProvider(output: ModuleResource, memoryModule: MemoryModule) {
    return {
      [Compiler.keys.__VIRTUAL_IMPORT_META__]: createImportMeta(output.realUrl),

      [Compiler.keys.__VIRTUAL_NAMESPACE__]: (memoryModule: MemoryModule) => {
        return this.getModule(memoryModule);
      },

      [Compiler.keys.__VIRTUAL_IMPORT__]: (moduleId: string) => {
        const storeId = transformUrl(output.storeId, moduleId);
        return this.import(storeId);
      },

      [Compiler.keys.__VIRTUAL_DYNAMIC_IMPORT__]: (moduleId: string) => {
        const storeId = transformUrl(output.storeId, moduleId);
        const requestUrl = transformUrl(output.realUrl, moduleId);
        return this.asyncImport(storeId, requestUrl);
      },

      [Compiler.keys.__VIRTUAL_EXPORT__]: (
        exportObject: Record<string, () => any>,
      ) => {
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
    };
  }

  compileAndFetchCode(storeId: string, url?: string): void | Promise<void> {
    if (this.resources[storeId]) return;
    if (!url) url = storeId;

    const p = this.loader
      .load<JavaScriptManager>(this.options.scope, url)
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

          const output = generateCode();
          output.map = await toBase64(output.map);
          (output as ModuleResource).storeId = storeId;
          (output as ModuleResource).realUrl = url;
          (output as ModuleResource).exports = exports;
          this.resources[storeId] = output as ModuleResource;
        } else {
          this.resources[storeId] = null;
        }
      });
    this.resources[storeId] = p;
    return p;
  }

  import(storeId: string) {
    return this.importModule(storeId) as MemoryModule;
  }

  asyncImport(storeId: string, requestUrl?: string) {
    const result = this.importModule(storeId, requestUrl || storeId);
    return Promise.resolve(result).then((memoryModule) => {
      return this.getModule(memoryModule);
    });
  }
}

export const runtime = new Runtime();
