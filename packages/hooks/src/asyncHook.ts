import { ArgsType, SyncHook } from './syncHook';

type CallbackReturnType = void | boolean | Promise<void | boolean>;

export class AsyncHook<T> extends SyncHook<T, CallbackReturnType> {
  emit(...data: ArgsType<T>): Promise<void | boolean> {
    let result;
    const ls = Array.from(this.listeners);
    if (ls.length > 0) {
      let i = 0;
      const call = (prev?: any) => {
        if (prev === false) {
          return false; // Abort process
        } else if (i < ls.length) {
          return Promise.resolve(ls[i++].apply(null, data)).then(call);
        }
      };
      result = call();
    }
    return Promise.resolve(result);
  }
}
