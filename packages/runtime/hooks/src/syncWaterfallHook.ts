import { warn, error } from '@garfish/utils';
import { SyncHook } from './syncHook';

export class SyncWaterfallHook<T> extends SyncHook<[T], T> {
  public onerror: (errMsg: string | Error) => void = error;

  constructor(type: string) {
    super();
    this.type = type;
  }

  emit(result: T) {
    for (const fn of this.listeners) {
      try {
        let illegalResult = false;
        const tempResult = fn(result);

        for (const key in result) {
          if (!(key in tempResult)) {
            illegalResult = true;
            this.onerror(
              `The "${this.type}" type has a plugin return value error.`,
            );
            break;
          }
        }
        if (!illegalResult) {
          result = tempResult;
        }
      } catch (e) {
        __DEV__ && warn(e);
        this.onerror(e);
      }
    }
    return result;
  }
}
