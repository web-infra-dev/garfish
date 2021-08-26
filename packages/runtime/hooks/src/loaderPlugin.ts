import { warn, error, hasOwn } from '@garfish/utils';

type Plugin<T extends any> = (result: T) => any;

export class PluginManager<T> {
  public type: string;
  public onerror: (errMsg: string | Error) => void = error;
  private plugins: Set<Plugin<T>> = new Set();

  constructor(type?: string) {
    this.type = type;
  }

  on(plugin: Plugin<T>) {
    if (this.plugins.has(plugin)) {
      __DEV__ && warn('Repeat add plugin');
      return;
    }
    this.plugins.add(plugin);
  }

  once(plugin: Plugin<T>) {
    const self = this;
    return this.once(function wrapper(...args) {
      self.remove(wrapper);
      return plugin.apply(null, args);
    });
  }

  emit<T extends Record<string, any>>(result: T) {
    for (const plugin of this.plugins) {
      try {
        let illegalResult = false;
        const tempResult = plugin(result as any);

        for (const key in result) {
          if (!hasOwn(key, tempResult)) {
            illegalResult = true;
            break;
          }
        }
        if (illegalResult) {
          this.onerror(
            `The "${this.type}" type has a plugin return value error.`,
          );
        } else {
          result = tempResult;
        }
      } catch (err) {
        __DEV__ && warn(err);
        this.onerror(err);
      }
    }
    return result;
  }

  remove(plugin: Plugin<T>) {
    if (this.plugins.has(plugin)) {
      this.plugins.delete(plugin);
    }
  }

  removeAll() {
    this.plugins.clear();
  }
}
