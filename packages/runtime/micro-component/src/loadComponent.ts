import { ComponentManager } from '@garfish/loader';
import { assert, deepMerge, isAbsolute } from '@garfish/utils';
import { loader } from './utils';
import { Actuator } from './actuator';

const LOADING = Object.create(null);
const CACHE_COMPONENTS = Object.create(null);
const PRE_STORED_RESOURCES = Object.create(null);

interface ComponentInfo {
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

export function loadComponent(
  name: string,
  options: ComponentInfo | string,
): Record<string, any> | null {
  const info = getLoadOptions(options);
  assert(info.url, `Missing url for loading "${name}" micro component`);
  assert(
    isAbsolute(info.url),
    'The loading of the micro component must be an absolute path.',
  );

  const { url, cache, version, error, adapter } = info;
  const nameWithVersion = `${name}@${version || 'latest'}`;

  const asyncLoadProcess = async () => {
    let result = null;
    try {
      const component = CACHE_COMPONENTS[nameWithVersion];
      if (cache && component) {
        result = component;
      } else {
        const data = await loader.loadComponent<ComponentManager>(name, url);
        const actuator = new Actuator(data.resourceManager);
        const exports = actuator.execScript().exports;
        if (typeof adapter === 'function') {
          adapter(exports);
        }
        result = exports.default || exports;
        CACHE_COMPONENTS[nameWithVersion] = result;
      }
    } catch (err) {
      if (typeof error === 'function') {
        result = error(err);
      } else {
        throw err;
      }
    } finally {
      LOADING[nameWithVersion] = null;
    }
    return result;
  };
  if (!LOADING[nameWithVersion]) {
    LOADING[nameWithVersion] = asyncLoadProcess();
  }
  return LOADING[nameWithVersion];
}

// Preload the static resources of the component, so that the component can be loaded synchronously
export function preloadComponent(name: string, url: string) {
  assert(
    isAbsolute(url || ''),
    'The loading of the micro component must be an absolute path.',
  );
  return loader.loadComponent<ComponentManager>(name, url).then((data) => {
    PRE_STORED_RESOURCES[url] = data.resourceManager;
  });
}

export function loadComponentSync(
  name: string,
  options: ComponentInfo | string,
): Record<string, any> {
  const info = getLoadOptions(options);
  assert(info.url, `Missing url for loading "${name}" micro component.`);
  assert(
    isAbsolute(info.url),
    'The loading of the micro component must be an absolute path.',
  );

  const { url, cache, version, error, adapter } = info;
  const nameWithVersion = `${name}@${version || 'latest'}`;
  let result = null;

  const component = CACHE_COMPONENTS[nameWithVersion];
  if (cache && component) {
    result = component;
  } else {
    const manager = PRE_STORED_RESOURCES[url];
    assert(
      manager,
      `Synchronously load ${name} components must load resources in advance.`,
    );

    try {
      const actuator = new Actuator(manager);
      const exports = actuator.execScript().exports;
      if (typeof adapter === 'function') {
        adapter(exports);
      }
      result = exports.default || exports;
      CACHE_COMPONENTS[nameWithVersion] = result;
    } catch (err) {
      if (typeof error === 'function') {
        result = error(err);
      } else {
        throw err;
      }
    }
  }
  return result;
}
