import { Loader, ModuleManager } from '@garfish/loader';
import {
  isObject,
  isPlainObject,
  deepMerge,
  safeWrapper,
  __LOADER_FLAG__,
} from '@garfish/utils';
import { loadModule } from './apis/loadModule';

export type ModuleConfig = Omit<ModuleInfo, 'version'> & {
  alias: Record<string, string>;
};

export interface ModuleInfo {
  cache?: boolean;
  version?: string;
  externals?: Record<string, any>;
  error?: (err: Error, info: ModuleInfo, alias: string) => any;
  adapter?: (cjsModule: Record<string, any>) => Record<string, any>;
}

export let currentApp: any;
export let resourcesStore: Array<ModuleManager> = [];
export const cacheModules = Object.create(null);
export const fetchLoading = Object.create(null);
export const moduleConfig: ModuleConfig = {
  alias: {},
  cache: true, // Default use cache
  externals: {
    loadModule, // Only `loadModule` is provided for use by remote modules
  },
};

// If garfish has pre-prepared data
let garfishGlobalEnv;

safeWrapper(() => {
  // @ts-ignore
  garfishGlobalEnv = __GARFISH_GLOBAL_ENV__;

  // Inherit the configuration from garfish
  if (isObject(garfishGlobalEnv)) {
    const { externals, currentApp: app, remoteModulesCode } = garfishGlobalEnv;
    if (app) {
      currentApp = app;
    }
    if (isObject(externals)) {
      Object.assign(moduleConfig.externals, externals);
    }
    if (Array.isArray(remoteModulesCode)) {
      resourcesStore = resourcesStore.concat(remoteModulesCode);
      remoteModulesCode.forEach((manager) => {
        if (manager.alias) {
          moduleConfig.alias[manager.alias] = manager.url;
        }
      });
    }
  }
});

export const loader: Loader = (() => {
  if (isObject(garfishGlobalEnv)) {
    const loader = garfishGlobalEnv.loader;
    // Garfish loader will have an identifier
    if (isObject(loader) && loader.personalId === __LOADER_FLAG__) {
      return loader;
    }
  }
  return new Loader();
})();

export const getModuleManager = (url: string) => {
  if (url) {
    // Do not use redirected url
    return resourcesStore.find((manager) => manager.originUrl === url);
  }
};

export const purifyOptions = (urlOrAlias: string, options?: ModuleInfo) => {
  let config;
  const globalExternals = moduleConfig.externals;
  delete moduleConfig.externals;

  if (isPlainObject(options) && options) {
    const curExternals = options.externals;
    delete options.externals;
    config = deepMerge(moduleConfig, { ...options, url: urlOrAlias });
    options.externals = curExternals;
    config.externals = { ...globalExternals, ...curExternals };
  } else {
    config = deepMerge(moduleConfig, { url: urlOrAlias });
    config.externals = globalExternals;
  }

  moduleConfig.externals = globalExternals;

  return config as ModuleInfo & {
    url: string;
  };
};

export const prettifyError = (
  error: Error | string,
  alias: string,
  url: string,
) => {
  const tipMarkers = [currentApp && currentApp.name, alias, url];
  let prefix = tipMarkers.reduce((msg, val, i) => {
    if (!val) return msg;
    return i === tipMarkers.length - 1
      ? msg + `"${val}"`
      : msg + `"${val}" -> `;
  }, 'remoteModule: ');
  prefix = ` (${prefix})`;

  if (typeof error === 'number') {
    error = String(error);
  }
  if (typeof error === 'string') {
    if (!error.endsWith(prefix)) {
      return `${error}${prefix}`;
    }
  }
  if (error instanceof Error) {
    if (!error.message.endsWith(prefix)) {
      error.message = `${error.message}${prefix}`;
    }
  }
  return error;
};
