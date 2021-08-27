import { SyncHook } from './syncHook';

export class AsyncHook extends SyncHook {
  emit(...data: Array<any>) {
    const ls = Array.from(this.listeners);
    if (ls.length > 0) {
      let i = 0;
      const call = (stop?: any) => {
        if (stop !== false && i < ls.length) {
          const result = ls[i++].apply(null, data);
          return Promise.resolve(result).then(call);
        }
      };
      return call();
    }
  }
}
