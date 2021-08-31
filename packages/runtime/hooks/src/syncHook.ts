import { warn } from '@garfish/utils';

type Callback<T extends Array<any>, K extends any> = (...args: T) => K;

export class SyncHook<T extends Array<any>, K extends any> {
  type: string = '';
  listeners = new Set<Callback<T, K>>();

  constructor(type?: string) {
    if (type) this.type = type;
  }

  on(fn: Callback<T, K>) {
    if (typeof fn === 'function') {
      this.listeners.add(fn);
    } else if (__DEV__) {
      warn('Invalid parameter in "Hook".');
    }
  }

  once(fn: Callback<T, K>) {
    const self = this;
    this.on(function wrapper(...args: Array<any>) {
      self.remove(wrapper);
      return fn.apply(null, args);
    });
  }

  emit(...data: T) {
    if (this.listeners.size > 0) {
      this.listeners.forEach((fn) => fn.apply(null, data));
    }
  }

  remove(fn: Callback<T, K>) {
    return this.listeners.delete(fn);
  }

  removeAll() {
    this.listeners.clear();
  }
}
