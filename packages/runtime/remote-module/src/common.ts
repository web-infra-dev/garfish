import { deepMerge, isObject } from '@garfish/utils';
import { Loader, ModuleManager } from '@garfish/loader';

export interface ModuleInfo {
  url: string;
  cache?: boolean;
  version?: string;
  env?: Record<string, any>;
  error?: (err: Error) => any;
  adapter?: (cjsModule: Record<string, any>) => Record<string, any>;
}

export let externals = Object.create(null);
export let resourcesStore: Array<ModuleManager> = [];
export const fetchLoading = Object.create(null);
export const cacheModules = Object.create(null);
export const alias: Record<string, string> = Object.create(null);

// If garfish has pre-prepared data
let garfishGlobalEnv;
try {
  // @ts-ignore
  garfishGlobalEnv = __GARFISH_GLOBAL_ENV__;

  // Inherit the configuration from garfish
  if (isObject(garfishGlobalEnv)) {
    const { remoteModulesCode, externals: GarfishExternals } = garfishGlobalEnv;
    if (isObject(GarfishExternals)) {
      externals = { ...GarfishExternals };
    }
    if (Array.isArray(remoteModulesCode)) {
      resourcesStore = resourcesStore.concat(remoteModulesCode);
      remoteModulesCode.forEach((manager) => {
        if (manager.alias) {
          alias[manager.alias] = manager.url;
        }
      });
    }
  }
} catch {}

export const loader: Loader = (() => {
  if (garfishGlobalEnv) {
    const loader = garfishGlobalEnv.loader;
    // Garfish loader will have an identifier
    if (loader && loader.personalId === Symbol.for('garfish.loader')) {
      return loader;
    }
  }
  return new Loader();
})();

export const purifyOptions = (options: ModuleInfo | string) => {
  if (typeof options === 'string') options = { url: options };
  // Default use cache
  return deepMerge({ cache: true }, options || {}) as ModuleInfo;
};

export const getCurrentApp = () => {
  return garfishGlobalEnv && garfishGlobalEnv.currentApp;
};

export const getModuleCode = (url: string) => {
  // It should be noted that if there is a redirect, `manager.url` is the url after the redirect
  return resourcesStore.find((manager) => manager.url === url);
};
