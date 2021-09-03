import { SyncHook, LoaderHook, PluginSystem } from '@garfish/hooks';
import { warn, isJs, isCss, isHtml, __LOADER_FLAG__ } from '@garfish/utils';
import { StyleManager } from './managers/style';
import { ModuleManager } from './managers/module';
import { TemplateManager } from './managers/template';
import { JavaScriptManager } from './managers/javascript';
import { request, copyResult, mergeConfig } from './utils';
import { FileTypes, cachedDataSet, AppCacheContainer } from './appCache';

// Export types and manager constructor
export * from './managers/style';
export * from './managers/module';
export * from './managers/template';
export * from './managers/javascript';

export type Manager =
  | StyleManager
  | ModuleManager
  | TemplateManager
  | JavaScriptManager;

interface LoadedHookArgs<T extends Manager> {
  result: Response;
  value: {
    url: string;
    code: string;
    fileType: FileTypes | '';
    resourceManager: T | null;
  };
}

export class Loader {
  public personalId = __LOADER_FLAG__;
  public StyleManager = StyleManager;
  public ModuleManager = ModuleManager;
  public TemplateManager = TemplateManager;
  public JavaScriptManager = JavaScriptManager;
  /** @deprecated */
  public requestConfig: RequestInit | ((url: string) => RequestInit);

  public hooks = new PluginSystem({
    error: new SyncHook<[Error], void>(),
    loaded: new LoaderHook<LoadedHookArgs<Manager>>('loaded'),
    clear: new LoaderHook<{
      scope: string;
      fileType?: FileTypes;
    }>('clear'),
    beforeLoad: new LoaderHook<{
      url: string;
      requestConfig: ResponseInit;
    }>('beforeLoad'),
  });

  private options: { maxSize?: number }; // The unit is "b"
  private loadingList: Record<string, Promise<any>>;
  private cacheStore: { [name: string]: AppCacheContainer };

  constructor(options?: { maxSize?: number }) {
    this.options = options || {};
    this.loadingList = Object.create(null);
    this.cacheStore = Object.create(null);
  }

  clear(scope: string, fileType?: FileTypes) {
    const appCacheContainer = this.cacheStore[scope];
    if (appCacheContainer) {
      appCacheContainer.clear(fileType);
      this.hooks.lifecycle.clear.emit({ scope, fileType });
    }
  }

  clearAll(fileType?: FileTypes) {
    for (const scope in this.cacheStore) {
      this.clear(scope, fileType);
    }
  }

  loadModule(url: string) {
    return this.load<ModuleManager>('modules', url, true);
  }

  // Unable to know the final data type, so through "generics"
  load<T extends Manager>(
    scope: string,
    url: string,
    isModule = false,
  ): Promise<LoadedHookArgs<T>['value']> {
    const { options, loadingList, cacheStore } = this;

    if (loadingList[url]) {
      return loadingList[url] as any;
    }

    let appCacheContainer = cacheStore[scope];
    if (!appCacheContainer) {
      appCacheContainer = cacheStore[scope] = new AppCacheContainer(
        options.maxSize,
      );
    }

    if (appCacheContainer.has(url)) {
      return Promise.resolve(copyResult(appCacheContainer.get(url)));
    } else {
      // If other containers have cache
      for (const key in cacheStore) {
        const container = cacheStore[key];
        if (container !== appCacheContainer) {
          if (container.has(url)) {
            const result = container.get(url);
            cachedDataSet.add(result);
            appCacheContainer.set(url, result, result.fileType);
            return Promise.resolve(copyResult(result));
          }
        }
      }
    }

    const requestConfig = mergeConfig(this, url);
    const resOpts = this.hooks.lifecycle.beforeLoad.emit({
      url,
      requestConfig,
    });

    loadingList[url] = request(resOpts.url, resOpts.requestConfig)
      .then(({ code, mimeType, result }) => {
        let managerCtor, fileType: FileTypes;

        if (isModule) {
          fileType = FileTypes.module;
          managerCtor = ModuleManager;
        } else if (isHtml(mimeType) || /\.html/.test(result.url)) {
          fileType = FileTypes.template;
          managerCtor = TemplateManager;
        } else if (isJs(mimeType) || /\.js/.test(result.url)) {
          fileType = FileTypes.js;
          managerCtor = JavaScriptManager;
        } else if (isCss(mimeType) || /\.css/.test(result.url)) {
          fileType = FileTypes.css;
          managerCtor = StyleManager;
        }

        // Use result.url, resources may be redirected
        const resourceManager: Manager | null = managerCtor
          ? new managerCtor(code, result.url)
          : null;

        // The results will be cached this time.
        // So, you can transform the request result.
        const data = this.hooks.lifecycle.loaded.emit({
          result,
          value: {
            url,
            resourceManager,
            fileType: fileType || '',
            code: resourceManager ? '' : code,
          },
        });

        appCacheContainer.set(url, data.value, fileType);
        return copyResult(data.value as any);
      })
      .catch((e) => {
        __DEV__ && warn(e);
        this.hooks.lifecycle.error.emit(e);
        throw e; // Let the upper application catch the error
      })
      .finally(() => {
        loadingList[url] = null;
      });
    return loadingList[url] as any;
  }
}
