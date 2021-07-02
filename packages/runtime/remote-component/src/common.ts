import { deepMerge } from '@garfish/utils';
import { Loader, ComponentManager } from '@garfish/loader';

export interface ComponentInfo {
  url: string;
  cache?: boolean;
  version?: string;
  env?: Record<string, any>;
  error?: (err: Error) => any;
  adapter?: (cjsModule: Record<string, any>) => Record<string, any>;
}

// If garfish has pre-prepared data
let garfishGlobalEnv;
try {
  // @ts-ignore
  garfishGlobalEnv = __GARFISH_GLOBAL_ENV__;
} catch {}

export const fetchLoading = Object.create(null);
export const cacheComponents = Object.create(null);
export const storedResources: Array<ComponentManager> = [];
export const externals: Record<PropertyKey, any> = garfishGlobalEnv
  ? { ...garfishGlobalEnv.externals }
  : {};

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

export const purifyOptions = (options: ComponentInfo | string) => {
  if (typeof options === 'string') options = { url: options };
  // Default use cache
  return deepMerge({ cache: true }, options || {}) as ComponentInfo;
};

export const getCurrentApp = () => {
  return garfishGlobalEnv && garfishGlobalEnv.currentApp;
};

export const getComponentCode = (url: string) => {
  if (garfishGlobalEnv) {
    const { remoteComponentsCode } = garfishGlobalEnv;
    if (Array.isArray(remoteComponentsCode)) {
      return storedResources
        .concat(remoteComponentsCode)
        .find((manager) => manager.url === url);
    }
  }
  return storedResources.find((manager) => manager.url === url);
};
