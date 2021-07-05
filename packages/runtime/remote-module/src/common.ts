import { Loader, ModuleManager } from '@garfish/loader';
import { assert, isObject, deepMerge } from '@garfish/utils';
import { loadModule } from './apis/loadModule';

export type ModuleConfig = Required<
  Omit<ModuleInfo, 'url' | 'version'> & { alias: Record<string, string> }
>;

export interface ModuleInfo {
  url: string;
  cache?: boolean;
  version?: string;
  env?: Record<string, any>;
  error?: (err: Error, info: ModuleInfo) => any;
  adapter?: (cjsModule: Record<string, any>) => Record<string, any>;
}

export let currentApp = null;
export let resourcesStore: Array<ModuleManager> = [];
export const cacheModules = Object.create(null);
export const fetchLoading = Object.create(null);
export const moduleConfig: ModuleConfig = {
  alias: {},
  cache: true, // Default use cache
  error: null,
  adapter: null,
  env: {
    loadModule, // Only `loadModule` is provided for use by remote modules
  },
};

// If garfish has pre-prepared data
let garfishGlobalEnv;
try {
  // @ts-ignore
  garfishGlobalEnv = __GARFISH_GLOBAL_ENV__;

  // Inherit the configuration from garfish
  if (isObject(garfishGlobalEnv)) {
    const { externals, currentApp: app, remoteModulesCode } = garfishGlobalEnv;
    if (app) {
      currentApp = app;
    }
    if (isObject(externals)) {
      moduleConfig.env = { ...externals };
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
} catch {}

export const loader: Loader = (() => {
  if (isObject(garfishGlobalEnv)) {
    const loader = garfishGlobalEnv.loader;
    // Garfish loader will have an identifier
    if (
      isObject(loader) &&
      loader.personalId === Symbol.for('garfish.loader')
    ) {
      return loader;
    }
  }
  return new Loader();
})();

export const purifyOptions = (options: ModuleInfo | string) => {
  assert(options, 'Missing url for loading remote module');
  if (typeof options === 'string') {
    options = { url: options };
  }
  return deepMerge(moduleConfig, options) as ModuleInfo;
};

export const getModuleCode = (url: string) => {
  // It should be noted that if there is a redirect, `manager.url` is the url after the redirect
  return resourcesStore.find((manager) => manager.url === url);
};
