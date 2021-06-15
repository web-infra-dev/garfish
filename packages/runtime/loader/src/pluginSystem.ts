import { error, hasOwn } from '@garfish/utils';

const ONCE_FLAG = Symbol('once');
const REGISTER_PLUGINS = new Set();

type Plugin<T extends any> = ((result: T) => any) & { _onceFlag?: Symbol };

export class PluginManager<T> {
  public type: string;
  public plugins: Set<Plugin<T>>;
  public onerror: (errMsg: string | Error) => void;

  constructor(type: string) {
    if (REGISTER_PLUGINS.has(type)) {
      throw new Error(`"${type}" has been created.`);
    }
    this.type = type;
    this.onerror = error;
    this.plugins = new Set();
  }

  add(plugin: Plugin<T>) {
    if (this.plugins.has(plugin)) {
      __DEV__ && console.error('repeat add plugin.');
      return false;
    }
    this.plugins.add(plugin);
    return true;
  }

  addOnce(plugin: Plugin<T>) {
    plugin._onceFlag = ONCE_FLAG;
    return this.add(plugin);
  }

  remove(plugin: Plugin<T>) {
    if (this.plugins.has(plugin)) {
      this.plugins.delete(plugin);
      return true;
    }
    return false;
  }

  run<T extends Record<string, any>>(result: T) {
    for (const fn of this.plugins) {
      try {
        result = fn(result as any);
        if (fn._onceFlag === ONCE_FLAG) this.remove(fn);
      } catch (err) {
        this.onerror(err);
        __DEV__ && console.error(err);
      }
    }
    return result;
  }
}
