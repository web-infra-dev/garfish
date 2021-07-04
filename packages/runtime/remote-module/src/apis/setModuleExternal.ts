import { warn, assert } from '@garfish/utils';
import { externals } from '../common';

export function setModuleExternal(
  nameOrExtObj: string | Record<string, any>,
  value?: any,
) {
  assert(nameOrExtObj, 'Invalid parameter.');
  if (typeof nameOrExtObj === 'object') {
    for (const key in nameOrExtObj) {
      if (__DEV__) {
        externals[key] &&
          warn(`The "${key}" will be overwritten in remote module external.`);
      }
      externals[key] = nameOrExtObj[key];
    }
  } else {
    externals[nameOrExtObj] = value;
  }
}
