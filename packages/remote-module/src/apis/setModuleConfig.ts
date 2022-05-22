import {
  warn,
  hasOwn,
  assert,
  isObject,
  isAbsolute,
  isPlainObject,
} from '@garfish/utils';
import { moduleConfig, ModuleConfig } from '../common';

// setModuleInfo({ alias: { utils: 'https://xx.js' } });
// loadModule('@utils').then((utils) => {});
const MARKER = '@';

const setAlias = (obj: ModuleConfig['alias']) => {
  for (const key in obj) {
    const value = obj[key];
    assert(
      isAbsolute(value),
      `The loading of the remote module must be an absolute path. "${value}"`,
    );
    moduleConfig.alias[key] = value;
  }
};

export function setModuleConfig(obj: Partial<ModuleConfig>) {
  assert(isPlainObject(obj), 'Module configuration must be an object.');
  for (const key in obj) {
    const res = obj[key];
    if (hasOwn(moduleConfig, key)) {
      if (key === 'env') {
        Object.assign(moduleConfig[key], res);
      } else if (key === 'alias' && res) {
        setAlias(res);
      } else {
        moduleConfig[key] = res;
      }
    } else if (__DEV__) {
      warn(`Invalid configuration "${key}".`);
    }
  }
}

export function processAlias(url: string): [string, Array<string>?] {
  // If url is an alias
  if (url && url.startsWith(MARKER)) {
    const segments = url.slice(MARKER.length).split('.');
    const name = segments[0];
    const realUrl = moduleConfig.alias[name];
    assert(realUrl, `Alias "${name}" is not defined.`);
    return [realUrl, segments];
  }
  return [url, undefined];
}

export function getValueInObject(
  obj: Record<string, any>,
  segments?: Array<string>,
) {
  if (Array.isArray(segments)) {
    const l = segments.length;
    if (l > 1) {
      for (let i = 1; i < l; i++) {
        const p = segments[i];
        // prettier-ignore
        assert(
          isObject(obj),
          `Remote module "${segments.slice(0, i).join('.')}" is ${obj}, cannot get "${p}" attribute from it.`,
        );
        obj = obj[p];
      }
    }
  }
  return obj;
}
