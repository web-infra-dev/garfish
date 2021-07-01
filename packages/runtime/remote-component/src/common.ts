import { Loader } from '@garfish/loader';
import { deepMerge } from '@garfish/utils';

export interface ComponentInfo {
  url: string;
  cache?: boolean; // Whether the cache
  version?: string;
  env?: Record<string, any>;
  error?: (err: Error) => any;
  adapter?: (cjsModule: Record<string, any>) => Record<string, any>;
}

export const LOADING = Object.create(null);
export const PRE_STORED_RESOURCES = Object.create(null);
export const cacheComponents = Object.create(null);

export const loader = (() => {
  if (window.Garfish) {
    const loader = window.Garfish && window.Garfish.loader;
    // Garfish loader will have an identifier
    if (loader && loader.personalId === Symbol.for('garfish.loader')) {
      return loader;
    }
    return new Loader();
  }
})();

const defaultOptions: Pick<ComponentInfo, 'cache'> = {
  cache: true,
};

export const purifyOptions = (options: ComponentInfo | string) => {
  if (typeof options === 'string') options = { url: options };
  return deepMerge(defaultOptions, options || {}) as ComponentInfo;
};
