import { warn, assert, hasOwn, isObject, isAbsolute } from '@garfish/utils';
import { alias } from '../common';

// setAlias('utils', 'https://xx.js');
// loadModule('@alias:utils').then((utils) => {});
const MARKER = '@alias:';

export function setModuleAlias(name: string, url: string) {
  assert(name, 'Alias cannot be empty.');
  assert(
    isAbsolute(url),
    `The loading of the remote module must be an absolute path. "${url}"`,
  );

  if (__DEV__ && hasOwn(alias, name)) {
    warn(`${name} is defined repeatedly.`);
  }
  alias[name] = url;
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
