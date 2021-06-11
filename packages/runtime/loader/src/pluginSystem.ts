import { error } from '@garfish/utils';

const ONCE_FLAG = Symbol('once');
const REGISTER_PLUGINS = new Set();

type Plugin = ((result: any) => Promise<any> | void) & { _onceFlag?: Symbol };

export class PluginManager {
  public type: string;
  public plugins: Set<Plugin>;
  public onerror: (errMsg: string | Error) => void;

  constructor(type: string) {
    if (REGISTER_PLUGINS.has(type)) {
      throw new Error(`"${type}" has been created.`);
    }
    this.type = type;
    this.onerror = error;
    this.plugins = new Set();
  }

  add(plugin: Plugin) {
    if (this.plugins.has(plugin)) {
      this.onerror('repeat add plugin');
      return false;
    }
    this.plugins.add(plugin);
    return true;
  }

  addOnce(plugin: Plugin) {
    plugin._onceFlag = ONCE_FLAG;
    return this.add(plugin);
  }

  remove(plugin: Plugin) {
    if (this.plugins.has(plugin)) {
      this.plugins.delete(plugin);
      return true;
    }
    return false;
  }

  run(result: any) {
    for (const fn of this.plugins) {
      try {
        result = fn(result);
        if (fn._onceFlag === ONCE_FLAG) {
          this.remove(fn);
        }
      } catch (err) {
        this.onerror(err);
        __DEV__ && console.error(err);
      }
    }
    return result;
  }
}

export function createLifecycle<T>(names: Array<keyof T>) {
  const hooks = {};
  for (const key of names) {
    hooks[key as string] = new PluginManager(key as string);
  }
  return hooks as { [key in keyof T]: PluginManager };
}
