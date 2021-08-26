import { SyncHook } from './syncHook';

export class AsyncHook extends SyncHook {
  emit(...data: Array<any>) {
    const hooks = this._hooks;
    if (hooks.length > 0) {
      let i = 0;
      const call = (stop?: any) => {
        if (stop !== false && i < hooks.length) {
          const result = this._hooks[i++].fn.apply(null, data);
          return Promise.resolve(result).then(call);
        }
      };
      return call();
    }
  }
}
