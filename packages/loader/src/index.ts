import {
  SyncHook,
  SyncWaterfallHook,
  PluginSystem,
  AsyncHook,
} from '@garfish/hooks';
import {
  error,
  macroTask,
  __LOADER_FLAG__,
  isJsType,
  isCssType,
  isHtmlType,
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
  /**
   * The unit is byte
   */
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

  private options: LoaderOptions;
  private loadingList: Record<string, Record<string, Promise<CacheValue<any>>>>;
  private cacheStore: { [name: string]: AppCacheContainer };

  constructor(options?: LoaderOptions) {
    this.options = options || {};
    this.loadingList = Object.create(null);
    this.cacheStore = Object.create(null);
  }

  setOptions(options: Partial<LoaderOptions>) {
    this.options = { ...this.options, ...options };
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

  usePlugin(options: LoaderPlugin) {
    this.hooks.usePlugin(options);
  }

  setLifeCycle(lifeCycle: Partial<LoaderLifecycle>) {
    this.hooks.usePlugin({
      name: 'loader-lifecycle',
      ...lifeCycle,
    });
  }

  loadModule(url: string) {
    return this.load<ModuleManager>({
      scope: 'modules',
      url,
      isRemoteModule: true,
    });
  }

  // Unable to know the final data type, so through "generics"
  async load<T extends Manager>({
    scope,
    url,
    isRemoteModule = false,
    crossOrigin = 'anonymous',
    defaultContentType = '',
  }: {
    scope: string;
    url: string;
    isRemoteModule?: boolean;
    crossOrigin?: NonNullable<HTMLScriptElement['crossOrigin']>;
    defaultContentType?: string;
  }): Promise<LoadedHookArgs<T>['value']> {
    const { options, loadingList, cacheStore } = this;

    const res = loadingList[url];
    // 增加 scope 作为缓存区分，相同 scope 的 loader 才做缓存
    // 否则可能出现，url 相同，不同子应用实例的共享同一 entryManager，在多个子应用同时 mount 时，在 vm sandbox 中会对 entryManager 的 document 进行赋值(app.entryManager.DOMApis.document = sandbox.global.document)
    // 这样当最后一个子应用实例对 entryManager.DOMApis.document 赋值时，其余子应用的 entryManager.DOMApis.document 将会指向最后一次实例化的子应用的 sandbox.global.document 变量，
    // dom 元素被创建时挂载的 sandbox id 为最后一个子应用的 sandbox id
    // 子应用通过 createElement 方法创建的 dom 元素将会被当做最后一个子应用的 deferClearEffects 副作用收集。
    // 当最后一个子应用被卸载时，其它子应用也将一起被卸载

    if (res && Object.keys(res).includes(scope)) {
      return macroTask(res[scope], 4);
    }

    let appCacheContainer = cacheStore[scope];
    if (!appCacheContainer) {
      appCacheContainer = cacheStore[scope] = new AppCacheContainer(
        options.maxSize,
      );
    }

    if (appCacheContainer.has(url)) {
      // When there is a real network request, some network io is consumed,
      // so we need to simulate the network io here to ensure that the timing of the request is correct when the cache timing is hit.
      return macroTask(copyResult(appCacheContainer.get(url)), 4);
    } else {
      // If other containers have cache
      for (const key in cacheStore) {
        const container = cacheStore[key];
        if (container !== appCacheContainer) {
          if (container.has(url)) {
            const result = container.get(url);
            cachedDataSet.add(result);
            appCacheContainer.set(url, result, result.fileType);
            return macroTask(copyResult(result), 4);
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
    const loadRes = request(resOpts.url, resOpts.requestConfig)
      .then(({ code, size, result, type }) => {
        let managerCtor,
          fileType: FileTypes | '' = '';

        if (isRemoteModule) {
          fileType = FileTypes.module;
          managerCtor = this.ModuleManager;
        } else if (
          isHtmlType({ type, src: result.url }) ||
          isHtmlType({
            type: defaultContentType,
          })
        ) {
          fileType = FileTypes.template;
          managerCtor = this.TemplateManager;
        } else if (
          isJsType({ type: defaultContentType }) ||
          isJsType({ type, src: result.url })
        ) {
          fileType = FileTypes.js;
          managerCtor = this.JavaScriptManager;
        } else if (
          isCssType({ src: result.url, type }) ||
          isCssType({
            type: defaultContentType,
          })
        ) {
          fileType = FileTypes.css;
          managerCtor = this.StyleManager;
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

        fileType && appCacheContainer.set(url, data.value, fileType);
        return copyResult(data.value as any);
      })
      .catch((e) => {
        __DEV__ && error(e);
        this.hooks.lifecycle.error.emit(e, { scope });
        throw e; // Let the upper application catch the error
      })
      .finally(() => {
        // 有 scope 区分之后无需置空
        // loadingList[url][scope] = null
      });

    loadingList[url]
      ? (loadingList[url][scope] = loadRes)
      : (loadingList[url] = { [scope]: loadRes });
    return loadRes;
  }
}
