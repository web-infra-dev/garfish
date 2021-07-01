import { Loader, ComponentManager } from '@garfish/loader';
import { deepMerge } from '@garfish/utils';

export interface ComponentInfo {
  url: string;
  cache?: boolean; // Whether the cache
  version?: string;
  env?: Record<string, any>;
  error?: (err: Error) => any;
  adapter?: (cjsModule: Record<string, any>) => Record<string, any>;
}

// @ts-ignore
// If garfish has pre-prepared data
const garfishGlobalEnv = __GARFISH_GLOBAL_ENV__;

export const fetchLoading = Object.create(null);
export const cacheComponents = Object.create(null);
export const storedResources: Array<ComponentManager> = [];
export const externals: Record<PropertyKey, any> = garfishGlobalEnv
  ? { ...garfishGlobalEnv.externals }
  : {};

const defaultOptions: Pick<ComponentInfo, 'cache'> = {
  cache: true,
};

export const loader: Loader = (() => {
  // @ts-ignore
  if (garfishGlobalEnv) {
    const loader = garfishGlobalEnv.loader;
    // Garfish loader will have an identifier
    if (loader && loader.personalId === Symbol.for('garfish.loader')) {
      return loader;
    }
    return new Loader();
  }
})();

export const purifyOptions = (options: ComponentInfo | string) => {
  if (typeof options === 'string') options = { url: options };
  return deepMerge(defaultOptions, options || {}) as ComponentInfo;
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
