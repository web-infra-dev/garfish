import { assert, error } from '@garfish/utils';
import { loader } from './utils';

interface ComponentInfo {
  name: string;
  url: string;
  cache?: boolean; // Whether the cache
  props?: Record<string, any>;
  version?: string;
}

export function loadComponent(name: string, options: ComponentInfo | string) {
  options = deepMerge(defaultLoadComponentOptions, options || ({} as any));
  const nameWithVersion = options?.version
    ? `${name}@${options.version}`
    : name;
  const asyncLoadProcess = async () => {
    // Existing cache caching logic
    let result = null;
    const cacheComponents = this.cacheComponents[nameWithVersion];
    if (options.cache && cacheComponents) {
      result = cacheComponents;
    } else {
      assert(options.url, `Missing url for loading "${name}" micro component`);

      const data = await this.loader.loadComponent<ComponentManager>(
        name,
        options.url,
      );

      try {
        result = new Component(
          this,
          { name, ...options },
          data.resourceManager,
        );
        this.cacheComponents[nameWithVersion] = result;
      } catch (e) {
        __DEV__ && error(e);
      } finally {
        this.loading[nameWithVersion] = null;
      }
    }
    return result;
  };

  if (!options.cache || !this.loading[nameWithVersion]) {
    this.loading[nameWithVersion] = asyncLoadProcess();
  }
  return this.loading[nameWithVersion];
}
