import { warn, error } from '@garfish/utils';
import { SyncHook } from './syncHook';

export class AsyncWaterfallHook<T> extends SyncHook<[T], T> {
  public onerror: (errMsg: string | Error) => void = error;

  constructor(type: string) {
    super();
    this.type = type;
  }

  emit(result: T) {
    const ls = Array.from(this.listeners);
    if (ls.length > 0) {
      let i = 0;
      const call = (prev?: any) => {
        if (i < ls.length) {
          let illegalResult = false;
          for (const key in result) {
            if (!(key in prev)) {
              illegalResult = true;
              this.onerror(
                `The "${this.type}" type has a plugin return value error.`,
              );
              break;
            }
          }
          if (!illegalResult) result = prev;
          try {
            return Promise.resolve(ls[i++].apply(null, result)).then(call);
          } catch (e) {
            __DEV__ && warn(e);
            this.onerror(e);
          }
        }
      };
      result = call();
    }
    return Promise.resolve(result);
  }
}
