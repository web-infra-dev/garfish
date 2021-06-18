import { isJs, isCss, isHtml, error, parseContentType } from '@garfish/utils';
import { PluginManager } from './pluginSystem';
import { FileType, AppCacheContainer } from './appCache';
import { StyleManager } from './managers/style';
import { TemplateManager } from './managers/template';
import { ComponentManager } from './managers/component';
import { JavaScriptManager } from './managers/javascript';

// Export types and manager constructor
export * from './managers/style';
export * from './managers/template';
export * from './managers/component';
export * from './managers/javascript';
export * from './managers/renderApi';

export type Manager =
  | StyleManager
  | TemplateManager
  | ComponentManager
  | JavaScriptManager;

export interface LoaderOptions {
  maxSize?: number; // The unit is "b"
}

interface ClearPluginArgs {
  scope: string;
  fileType?: FileType;
}

interface LoadedPluginArgs<T> {
  result: Response;
  value: {
    url: string;
    code: string;
    fileType: FileType | '';
    resourceManager: T | null;
  };
}

interface BeforeLoadPluginArgs {
  url: string;
  requestConfig: ResponseInit;
}

const request = async (url: string, config: RequestInit) => {
  const result = await fetch(url, config || {});
  // Response codes greater than "400" are regarded as errors
  if (result.status >= 400) {
    error(`"${url}" load failed with status "${result.status}"`);
  }
  const code = await result.text();
  const type = result.headers.get('content-type');
  const mimeType = parseContentType(type);
  return { code, result, mimeType };
};

const copyResult = (result: LoadedPluginArgs<any>['value']) => {
  if (result.resourceManager) {
    result.resourceManager = result.resourceManager.clone();
  }
  return result;
};

// Compatible with old api
const mergeConfig = (loader: Loader, url: string) => {
  const extra = loader.requestConfig;
  const config = typeof extra === 'function' ? extra(url) : extra;
  return { mode: 'cors', ...config } as RequestInit;
};

export class Loader {
  public lifecycle = {
    clear: new PluginManager<ClearPluginArgs>('clear'),
    loaded: new PluginManager<LoadedPluginArgs<Manager>>('loaded'),
    beforeLoad: new PluginManager<BeforeLoadPluginArgs>('beforeLoad'),
  };

  /**
   * @deprecated
   */
  public requestConfig: RequestInit | ((url: string) => RequestInit);

  private options: LoaderOptions;
  private cacheStore: { [name: string]: AppCacheContainer };
  private loadingList: Record<
    string,
    Promise<LoadedPluginArgs<Manager>['value']>
  >;

  constructor(options?: LoaderOptions) {
    this.options = options || {};
    this.loadingList = Object.create(null);
    this.cacheStore = Object.create(null);
  }

  clear(scope: string, fileType?: FileType) {
    const appCacheContainer = this.cacheStore[scope];
    if (appCacheContainer) {
      appCacheContainer.clear(fileType);
      this.lifecycle.clear.run({ scope, fileType });
    }
  }

  clearAll(fileType?: FileType) {
    for (const scope in this.cacheStore) {
      this.clear(scope, fileType);
    }
  }

  loadComponent<T extends Manager>(scope: string, url: string) {
    return this.load<T>(scope, url, true);
  }

  // Unable to know the final data type, so through "generics"
  load<T extends Manager>(
    scope: string,
    url: string,
    isComponent = false,
  ): Promise<LoadedPluginArgs<T>['value']> {
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
        if (container === appCacheContainer) continue;
        if (container.has(url)) {
          const result = container.get(url);
          appCacheContainer.set(url, result, result.fileType);
          return Promise.resolve(copyResult(result));
        }
      }
    }

    const requestConfig = mergeConfig(this, url);
    const resOpts = this.lifecycle.beforeLoad.run({ url, requestConfig });

    loadingList[url] = request(resOpts.url, resOpts.requestConfig)
      .finally(() => {
        loadingList[url] = null;
      })
      .then(async ({ code, mimeType, result }) => {
        let managerCtor, fileType: FileType;

        if (isComponent) {
          fileType = 'component';
          managerCtor = ComponentManager;
        } else if (isHtml(mimeType) || /\.html/.test(result.url)) {
          fileType = 'template';
          managerCtor = TemplateManager;
        } else if (isJs(mimeType) || /\.js/.test(result.url)) {
          fileType = 'js';
          managerCtor = JavaScriptManager;
        } else if (isCss(mimeType) || /\.css/.test(result.url)) {
          fileType = 'css';
          managerCtor = StyleManager;
        }

        // Use result.url, resources may be redirected
        const resourceManager: Manager | null = managerCtor
          ? new managerCtor(code, result.url)
          : null;

        // The results will be cached this time.
        // So, you can transform the request result.
        const data = this.lifecycle.loaded.run({
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
      });
    return loadingList[url] as any;
  }
}
