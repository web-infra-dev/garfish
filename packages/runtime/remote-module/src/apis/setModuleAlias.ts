import { warn, assert, hasOwn, isAbsolute } from '@garfish/utils';
import { alias } from '../common';

// setAlias('a', 'https://xx.js');
// loadModule('@RemoteModule:a').then((module) => {});
const MARKER = '@RemoteModule:';

export function setModuleAlias(name: string, url: string) {
  assert(name, 'Alias cannot be empty.');
  assert(
    isAbsolute(url),
    `The loading of the remote module must be an absolute path. "${url}"`,
  );

  if (__DEV__ && hasOwn(alias, name)) {
    warn(`${name} is defined repeatedly.`);
  }
  alias[`${MARKER}${name}`] = url;
}

export function filterAlias(url: string) {
  if (url && url.startsWith(MARKER)) {
    // If url is an alias
    const len = MARKER.length;
    assert(url.length !== len, `Alias "${url}" cannot be empty.`);

    const name = url.slice(len);
    const realUrl = alias[name];
    assert(realUrl, `Alias "${name}" is not defined.`);
    return realUrl;
  }
  return url;
}
