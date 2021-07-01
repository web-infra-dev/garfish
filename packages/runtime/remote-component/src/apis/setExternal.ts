import { warn, assert } from '@garfish/utils';
import { externals } from '../common';

export function setExternal(
  nameOrExtObj: string | Record<string, any>,
  value?: any,
) {
  assert(nameOrExtObj, 'Invalid parameter.');
  if (typeof nameOrExtObj === 'object') {
    for (const key in nameOrExtObj) {
      if (externals[key]) {
        __DEV__ &&
          warn(
            `The "${key}" will be overwritten in remote components external.`,
          );
      }
      externals[key] = nameOrExtObj[key];
    }
  } else {
    externals[nameOrExtObj] = value;
  }
}
