import { SyncHook, AsyncHook } from '@garfish/hooks';
import { assert, isPlainObject } from '@garfish/utils';

type Plugin<T> = Partial<Record<keyof T, (...args: Array<any>) => void>> & {
  name: string;
};

export class HooksSystem<T extends Record<string, SyncHook | AsyncHook>> {
  lifecycle: T;
  lifecycleKeys: Array<keyof T>;
  private registerPlugins: Record<string, Plugin<T>> = {};

  constructor(lifecycle: T) {
    this.lifecycle = lifecycle;
    this.lifecycleKeys = Object.keys(lifecycle);
  }

  usePlugin(plugin: Plugin<T>) {
    // Plugin name is required and unique
    const pluginName = plugin.name;
    assert(pluginName, 'Plugin must provide a name');
    assert(isPlainObject(plugin), 'Plugin must return object type.');

    if (!this.registerPlugins[pluginName]) {
      this.registerPlugins[pluginName] = plugin;

      for (const key in this.lifecycle) {
        const pluginLife = plugin[key as string];
        if (pluginLife) {
          // Differentiate different types of hooks and adopt different registration strategies
          this.lifecycle[key].on(pluginLife);
        }
      }
    }
  }

  removePlugin(plugin: Plugin<T>) {
    assert(isPlainObject(plugin), 'Invalid plugin configuration');
    for (const key in plugin) {
      this.lifecycle[key].remove(plugin[key as string]);
    }
  }
}
