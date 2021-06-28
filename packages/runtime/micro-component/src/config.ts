import { deepMerge } from '@garfish/utils';

export interface ComponentInfo {
  url: string;
  cache?: boolean; // Whether the cache
  version?: string;
  props?: Record<string, any>;
  error?: (err: Error) => any;
  adapter?: (cjsModule: Record<string, any>) => Record<string, any>;
}

const defaultOptions: Pick<ComponentInfo, 'cache'> = {
  cache: true,
};

export function getLoadOptions(options: ComponentInfo | string) {
  if (typeof options === 'string') {
    options = { url: options } as any;
  }
  return deepMerge(defaultOptions, options || {}) as ComponentInfo;
}
