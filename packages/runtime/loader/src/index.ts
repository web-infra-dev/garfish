import { isCss, isJs, isHtml, error, parseContentType } from '@garfish/utils';
import { createLifecycle } from './pluginSystem';
import { FileType, AppCacheContainer } from './appCache';

interface LoaderOptions {
  maxSize?: number; // The unit is "b"
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

// Compatible with old api
const mergeConfig = (loader: Loader, url: string) => {
  const extra = loader.requestConfig;
  const config = typeof extra === 'function' ? extra(url) : extra;
  return { mode: 'cors', ...config } as RequestInit;
};

export default class Loader {
  public requestConfig: RequestInit | ((url: string) => RequestInit);
  public lifecycle = createLifecycle(['clear', 'loaded', 'beforeLoad']);

  private options: LoaderOptions;
  private loadingList: Record<string, Promise<any>>;
  private cacheStore: { [name: string]: AppCacheContainer };

  constructor(options: LoaderOptions) {
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

  loadComponent(scope: string, url: string) {
    return this.load(scope, url, true);
  }

  // Unable to know the final data type, so through "generics"
  load<T extends any>(
    scope: string,
    url: string,
    isComponent?: boolean,
  ): Promise<T> {
    const { options, loadingList, cacheStore } = this;

    if (loadingList[url]) {
      return loadingList[url];
    }

    let appCacheContainer = cacheStore[scope];
    if (appCacheContainer) {
      appCacheContainer = cacheStore[scope] = new AppCacheContainer(
        options.maxSize,
      );
    }

    if (appCacheContainer.has(url)) {
      return Promise.resolve(appCacheContainer.get(url));
    }

    const requestConfig = mergeConfig(this, url);
    const resOpts = this.lifecycle.beforeLoad.run({ url, requestConfig });

    loadingList[url] = request(resOpts.url, resOpts.config).then(
      async ({ code, mimeType, result }) => {
        loadingList[url] = null;
        // The results will be cached this time.
        // So, you can transform the request result.
        const data = this.lifecycle.loaded.run({
          code,
          result,
          mimeType,
          isComponent,
        });

        let fileType: FileType;

        if (isComponent) {
          fileType = 'component';
        } else if (isHtml(mimeType) || /\.html/.test(url)) {
          fileType = 'html';
        } else if (isJs(mimeType) || /\.js/.test(url)) {
          fileType = 'js';
        } else if (isCss(mimeType) || /\.css/.test(url)) {
          fileType = 'css';
        }

        appCacheContainer.set(url, data, fileType);
        return data;
      },
    );
    return loadingList[url];
  }
}
