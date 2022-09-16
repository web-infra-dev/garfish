import { ArgsType, SyncHook } from './syncHook';

type CallbackReturnType = void | false | Promise<void | false>;

export class AsyncHook<
  T,
  ExternalEmitReturnType = CallbackReturnType,
> extends SyncHook<T, CallbackReturnType | Promise<ExternalEmitReturnType>> {
  emit(...data: ArgsType<T>): Promise<void | false | ExternalEmitReturnType> {
    let result;
    const ls = Array.from(this.listeners);
    if (ls.length > 0) {
      let i = 0;
      const call = (prev?: any) => {
        if (prev === false) {
          return false; // Abort process
        } else if (i < ls.length) {
          return Promise.resolve(ls[i++].apply(null, data)).then(call);
        } else {
          return prev;
        }
      };
      result = call();
    }
    return Promise.resolve(result);
  }
}
