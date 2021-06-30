import { warn, assert, deepMerge, isAbsolute } from '@garfish/utils';
import { loader } from './loader';
import { Actuator, EXTERNALS } from './actuator';

const LOADING = Object.create(null);
const PRE_STORED_RESOURCES = Object.create(null);
export const cacheComponents = Object.create(null);

interface ComponentInfo {
  url: string;
  cache?: boolean; // Whether the cache
  version?: string;
  env?: Record<string, any>;
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
  options: ComponentInfo | string,
): Promise<Record<string, any> | null> {
  const info = getLoadOptions(options);
  assert(info.url, 'Missing url for loading micro component');
  assert(
    isAbsolute(info.url),
    'The loading of the micro component must be an absolute path.',
  );

  const { url, env, cache, version, error, adapter } = info;
  // `1.0@https://xx.js`
  // `latest@https://xx.js`
  const urlWithVersion = `${version || 'latest'}@${url}`;

  const asyncLoadProcess = async () => {
    let result = null;
    try {
      const component = cacheComponents[urlWithVersion];
      if (cache && component) {
        result = component;
      } else {
        const data = await loader.loadComponent(url);
        const actuator = new Actuator(data.resourceManager, env);
        let exports = actuator.execScript().exports;
        if (typeof adapter === 'function') {
          exports = adapter(exports);
        }
        result = exports;
        cacheComponents[urlWithVersion] = result;
      }
    } catch (err) {
      if (typeof error === 'function') {
        result = error(err);
      } else {
        throw err;
      }
    } finally {
      LOADING[urlWithVersion] = null;
    }
    return result;
  };
  if (!LOADING[urlWithVersion]) {
    LOADING[urlWithVersion] = asyncLoadProcess();
  }
  return LOADING[urlWithVersion];
}

export function loadComponentSync(
  options: ComponentInfo | string,
): Record<string, any> {
  const info = getLoadOptions(options);
  assert(info.url, 'Missing url for loading micro component');
  assert(
    isAbsolute(info.url),
    'The loading of the micro component must be an absolute path.',
  );

  const { url, env, cache, version, error, adapter } = info;
  const urlWithVersion = `${version || 'latest'}@${url}`;
  let result = null;

  const component = cacheComponents[urlWithVersion];
  if (cache && component) {
    result = component;
  } else {
    const manager = PRE_STORED_RESOURCES[url];
    assert(
      manager,
      'Synchronously load components must load resources in advance.',
    );

    try {
      const actuator = new Actuator(manager, env);
      let exports = actuator.execScript().exports;
      if (typeof adapter === 'function') {
        exports = adapter(exports);
      }
      result = exports;
      cacheComponents[urlWithVersion] = result;
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

// Preload the static resources of the component, so that the component can be loaded synchronously
export function preload(urls: string | Array<string>) {
  if (!Array.isArray(urls)) urls = [urls];

  return Promise.all(
    urls.map((url) => {
      assert(
        isAbsolute(url || ''),
        'The loading of the micro component must be an absolute path.',
      );
      return loader.loadComponent(url).then((data) => {
        PRE_STORED_RESOURCES[url] = data.resourceManager;
      });
    }),
  );
}

export function setExternal(
  nameOrExtObj: string | Record<string, any>,
  value?: any,
) {
  assert(nameOrExtObj, 'Invalid parameter.');
  if (typeof nameOrExtObj === 'object') {
    for (const key in nameOrExtObj) {
      if (EXTERNALS[key]) {
        __DEV__ && warn(`The "${key}" will be overwritten in external.`);
      }
      EXTERNALS[key] = nameOrExtObj[key];
    }
  } else {
    EXTERNALS[nameOrExtObj] = value;
  }
}
