import { SyncHook } from './syncHook';

export class AsyncHook extends SyncHook {
  emit(...data: Array<any>) {
    const hs = this.hooks;
    if (hs.length > 0) {
      let i = 0;
      const call = (stop?: any) => {
        if (stop !== false && i < hs.length) {
          const result = hs[i++].fn.apply(null, data);
          return Promise.resolve(result).then(call);
        }
      };
      return call();
    }
  }
}
