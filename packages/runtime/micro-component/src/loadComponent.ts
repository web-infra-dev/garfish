import { ComponentManager } from '@garfish/loader';
import { assert } from '@garfish/utils';
import { loader } from './utils';
import { Actuator } from './actuator';
import { getLoadOptions, ComponentInfo } from './config';

const LOADING = Object.create(null);
const CACHE_COMPONENTS = Object.create(null);
const PRE_STORED_RESOURCES = Object.create(null);

export function prevloadComponent() {}

export function loadComponent(name: string, options: ComponentInfo | string) {
  const info = getLoadOptions(options);
  assert(info.url, `Missing url for loading "${name}" micro component`);

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
