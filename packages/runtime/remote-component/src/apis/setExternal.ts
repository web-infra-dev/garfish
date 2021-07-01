import { warn, assert, deepMerge, isAbsolute } from '@garfish/utils';
import { Actuator, EXTERNALS } from '../actuator';

export function setExternal(
  nameOrExtObj: string | Record<string, any>,
  value?: any,
) {
  assert(nameOrExtObj, 'Invalid parameter.');
  if (typeof nameOrExtObj === 'object') {
    for (const key in nameOrExtObj) {
      if (EXTERNALS[key]) {
        __DEV__ &&
          warn(
            `The "${key}" will be overwritten in remote components external.`,
          );
      }
      EXTERNALS[key] = nameOrExtObj[key];
    }
  } else {
    EXTERNALS[nameOrExtObj] = value;
  }
}
