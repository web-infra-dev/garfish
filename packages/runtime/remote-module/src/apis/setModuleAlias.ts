import { warn, assert, isObject, isAbsolute } from '@garfish/utils';
import { alias } from '../common';

// setAlias('utils', 'https://xx.js');
// loadModule('@alias:utils').then((utils) => {});
const MARKER = '@alias:';

export function setModuleAlias(
  nameOrExtObj: string | Record<string, string>,
  url?: string,
) {
  assert(nameOrExtObj, 'Invalid parameter.');
  if (typeof nameOrExtObj === 'string') {
    nameOrExtObj = { [nameOrExtObj]: url };
  }
  for (const key in nameOrExtObj) {
    const value = nameOrExtObj[key];
    assert(
      isAbsolute(value),
      `The loading of the remote module must be an absolute path. "${value}"`,
    );
    if (__DEV__) {
      alias[key] && warn(`${key} is defined repeatedly.`);
    }
    alias[key] = value;
  }
}

type AliasResult = [string, Array<string> | null];
export function processAlias(url: string): AliasResult {
  // If url is an alias
  if (url && url.startsWith(MARKER)) {
    const segments = url.slice(MARKER.length).split('.');
    const name = segments[0];
    const realUrl = alias[name];
    assert(realUrl, `Alias "${name}" is not defined.`);
    return [realUrl, segments];
  }
  return [url, null];
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
