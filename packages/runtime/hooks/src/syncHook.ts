import { warn } from '@garfish/utils';

type Callback = (...args: Array<any>) => void;

export class SyncHook {
  type: string = '';
  listeners = new Set<Callback>();

  constructor(type?: string) {
    if (type) this.type = type;
  }

  on(fn: Callback) {
    if (typeof fn === 'function') {
      this.listeners.add(fn);
    } else if (__DEV__) {
      warn('Invalid parameter in "Hook".');
    }
  }

  once(fn: Function) {
    const self = this;
    this.on(function wrapper(...args: Array<any>) {
      self.remove(wrapper);
      fn(...args);
    });
  }

  emit(...data: Array<any>) {
    if (this.listeners.size > 0) {
      this.listeners.forEach((fn) => fn.apply(null, data));
    }
  }

  remove(fn: Callback) {
    return this.listeners.delete(fn);
  }

  removeAll() {
    this.listeners.clear();
  }
}
