import { warn, error, isObject } from '@garfish/utils';
import { SyncHook } from './syncHook';

export function checkReturnData(originData, returnData) {
  if (!isObject(returnData)) return false;
  if (originData !== returnData) {
    for (const key in originData) {
      if (!(key in returnData)) {
        return false;
      }
    }
  }
  return true;
}

export class SyncWaterfallHook<T extends Record<string, any>> extends SyncHook<
  [T],
  T
> {
  public onerror: (errMsg: string | Error) => void = error;

  constructor(type: string) {
    super();
    this.type = type;
  }

  emit(data: T) {
    if (!isObject(data)) {
      error(`"${this.type}" hook response data must be an object.`);
    }
    for (const fn of this.listeners) {
      try {
        const tempData = fn(data);
        if (checkReturnData(data, tempData)) {
          data = tempData;
        } else {
          this.onerror(
            `The "${this.type}" type has a plugin return value error.`,
          );
          break;
        }
      } catch (e) {
        __DEV__ && warn(e);
        this.onerror(e);
      }
    }
    return data;
  }
}
