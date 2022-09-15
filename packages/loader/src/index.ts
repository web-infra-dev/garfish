import {
  SyncHook,
  AsyncHook,
  SyncWaterfallHook,
  PluginSystem,
} from '@garfish/hooks';
import {
  error,
  isJsType,
  isCssType,
  isHtmlType,
  __LOADER_FLAG__,
} from '@garfish/utils';
import { StyleManager } from './managers/style';
import { ModuleManager } from './managers/module';
import { TemplateManager } from './managers/template';
import { JavaScriptManager } from './managers/javascript';
import { getRequest, copyResult, mergeConfig } from './utils';
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

export interface LoaderOptions {
  maxSize?: number;
}

export interface CacheValue<T extends Manager> {
  url: string;
  code: string;
  size: number;
  scope: string;
  fileType: FileTypes | '';
  resourceManager: T | null;
}

export interface LoadedHookArgs<T extends Manager> {
  result: Response;
  value: CacheValue<T>;
}

export enum CrossOriginCredentials {
  anonymous = 'same-origin',
  'use-credentials' = 'include',
}

type LifeCycle = Loader['hooks']['lifecycle'];

export type LoaderLifecycle = Partial<{
  [k in keyof LifeCycle]: Parameters<LifeCycle[k]['on']>[0];
}>;

export interface LoaderPlugin extends LoaderLifecycle {
  name: string;
  version?: string;
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
    error: new SyncHook<[Error, { scope: string }], void>(),
    loaded: new SyncWaterfallHook<LoadedHookArgs<Manager>>('loaded'),
    clear: new SyncWaterfallHook<{
      scope: string;
      fileType?: FileTypes;
    }>('clear'),
    beforeLoad: new SyncWaterfallHook<{
      url: string;
      scope: string;
      requestConfig: ResponseInit;
    }>('beforeLoad'),
    fetch: new AsyncHook<[string, RequestInit], Response | void | false>(
      'fetch',
    ),
  });

  private options: LoaderOptions; // The unit is "b"
  private loadingList: Record<string, Promise<any>>;
  private cacheStore: { [name: string]: AppCacheContainer };

  constructor(options?: LoaderOptions) {
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

  setLifeCycle(lifeCycle: Partial<LoaderLifecycle>) {
    this.hooks.usePlugin({
      name: 'loader-lifecycle',
      ...lifeCycle,
    });
  }

  loadModule(url: string) {
    return this.load<ModuleManager>('modules', url, true);
  }

  // Unable to know the final data type, so through "generics"
  load<T extends Manager>(
    scope: string,
    url: string,
    isRemoteModule = false,
    crossOrigin: HTMLScriptElement['crossOrigin'] = 'anonymous',
    defaultContentType = '',
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
    // Tells browsers to include credentials in both same- and cross-origin requests, and always use any credentials sent back in responses.
    requestConfig.credentials = CrossOriginCredentials[crossOrigin];
    const resOpts = this.hooks.lifecycle.beforeLoad.emit({
      url,
      scope,
      requestConfig,
    });

    const request = getRequest(this.hooks.lifecycle.fetch);
    loadingList[url] = request(resOpts.url, resOpts.requestConfig)
      .then(({ code, size, result, type }) => {
        let managerCtor, fileType: FileTypes;

        if (isRemoteModule) {
          fileType = FileTypes.module;
          managerCtor = ModuleManager;
        } else if (
          isHtmlType({ type, src: result.url }) ||
          isHtmlType({
            type: defaultContentType,
          })
        ) {
          fileType = FileTypes.template;
          managerCtor = TemplateManager;
        } else if (
          isJsType({ type: defaultContentType }) ||
          isJsType({ type, src: result.url })
        ) {
          fileType = FileTypes.js;
          managerCtor = JavaScriptManager;
        } else if (
          isCssType({ src: result.url, type }) ||
          isCssType({
            type: defaultContentType,
          })
        ) {
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
            scope,
            resourceManager,
            fileType: fileType || '',
            // For performance reasons, take an approximation
            size: size || code.length,
            code: resourceManager ? '' : code,
          },
        });

        appCacheContainer.set(url, data.value, fileType);
        return copyResult(data.value as any);
      })
      .catch((e) => {
        __DEV__ && error(e);
        this.hooks.lifecycle.error.emit(e, { scope });
        throw e; // Let the upper application catch the error
      })
      .finally(() => {
        loadingList[url] = null;
      });
    return loadingList[url] as any;
  }
}
