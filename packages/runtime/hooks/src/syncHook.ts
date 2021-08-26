import { warn } from '@garfish/utils';

type HookCallback = (...args: Array<any>) => void;

export class SyncHook {
  _hooks: Array<{ name: string; fn: HookCallback }> = [];

  on(name: string, fn: HookCallback) {
    if (typeof name === 'string' && typeof fn === 'function') {
      this._hooks.push({ name, fn });
    } else if (__DEV__) {
      warn('Invalid parameter');
    }
  }

  once(name: string, fn: Function) {
    const self = this;
    this.on(name, function wrapper(...args: Array<any>) {
      self.remove(name, wrapper);
      fn(...args);
    });
  }

  emit(...data: Array<any>) {
    if (this._hooks.length > 0) {
      this._hooks.forEach((hook) => hook.fn.apply(null, data));
    }
  }

  remove(name: string, fn: HookCallback) {
    for (let i = 0; i < this._hooks.length; i++) {
      const hook = this._hooks[i];
      if (name === hook.name) {
        if (fn && fn !== hook.fn) {
          continue;
        }
        this._hooks.splice(i, 1);
        i--;
      }
    }
  }

  removeAll() {
    this._hooks.length = 0;
  }
}
