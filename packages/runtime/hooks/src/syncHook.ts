import { warn } from '@garfish/utils';

type Callback = (...args: Array<any>) => void;

export class SyncHook {
  public type: string = '';
  public hooks: Array<{ name: string; fn: Callback }> = [];

  constructor(type?: string) {
    if (type) this.type = type;
  }

  on(name: string, fn: Callback) {
    if (typeof name === 'string' && typeof fn === 'function') {
      this.hooks.push({ name, fn });
    } else if (__DEV__) {
      warn('Invalid parameter');
    }
  }

  once(name: string, fn: Callback) {
    const self = this;
    this.on(name, function wrapper(...args: Array<any>) {
      self.remove(name, wrapper);
      fn(...args);
    });
  }

  emit(...data: Array<any>) {
    if (this.hooks.length > 0) {
      this.hooks.forEach((hook) => hook.fn.apply(null, data));
    }
  }

  remove(name: string, fn: Callback) {
    for (let i = 0; i < this.hooks.length; i++) {
      const hook = this.hooks[i];
      if (name === hook.name) {
        if (fn && fn !== hook.fn) {
          continue;
        }
        this.hooks.splice(i, 1);
        i--;
      }
    }
  }

  removeAll() {
    this.hooks.length = 0;
  }
}
