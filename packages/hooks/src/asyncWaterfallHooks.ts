import { warn, error } from '@garfish/utils';
import { SyncHook } from './syncHook';
import { checkReturnData } from './syncWaterfallHook';

export class AsyncWaterfallHook<T> extends SyncHook<[T], Promise<T> | T> {
  public onerror: (errMsg: string | Error) => void = error;

  constructor(type: string) {
    super();
    this.type = type;
  }

  emit(data: T) {
    const ls = Array.from(this.listeners);
    if (ls.length > 0) {
      let i = 0;
      const processError = (e) => {
        __DEV__ && warn(e);
        this.onerror(e);
        return data;
      };

      const call = (prevData: T) => {
        if (checkReturnData(data, prevData)) {
          data = prevData;
          if (i < ls.length) {
            let curResult;
            try {
              curResult = ls[i++](data);
            } catch (e) {
              processError(e);
            }
            if (curResult) {
              return Promise.resolve(curResult).then(call, processError);
            }
          }
        } else {
          this.onerror(
            `The "${this.type}" type has a plugin return value error.`,
          );
        }
        return data;
      };
      data = call(data);
    }
    return Promise.resolve(data);
  }
}
