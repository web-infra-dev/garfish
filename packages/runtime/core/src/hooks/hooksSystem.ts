import { assert, isObject } from '@garfish/utils';
import { SyncHook, AsyncHook } from '@garfish/hooks';

type Plugin<T> = Partial<Record<keyof T, (...args: Array<any>) => void>> & {
  name: string;
};

export class HooksSystem<T extends Record<string, SyncHook | AsyncHook>> {
  type: string;
  lifecycle: T;
  lifecycleKeys: Array<keyof T>;
  private registerPlugins = new WeakSet<Plugin<T>>();

  constructor(type: string, lifecycle: T) {
    this.type = type;
    this.lifecycle = lifecycle;
    this.lifecycleKeys = Object.keys(lifecycle);
  }

  usePlugin(plugin: Plugin<T>) {
    // Plugin name is required and unique
    const pluginName = plugin.name;
    assert(pluginName, 'Plugin must provide a name');
    assert(isObject(plugin), 'Plugin must return object type.');

    if (!this.registerPlugins.has(plugin)) {
      this.registerPlugins.add(plugin);

      for (const key in this.lifecycle) {
        const pluginLife = plugin[key as string];
        if (pluginLife) {
          // Differentiate different types of hooks and adopt different registration strategies
          this.lifecycle[key].on(pluginName, pluginLife);
        }
      }
    }
  }

  removePlugin(plugin: Plugin<T>) {
    const pluginName = plugin.name;
    assert(pluginName, 'Plugin must provide a name');
    for (const key in this.lifecycle) {
      this.lifecycle[key].remove(pluginName, plugin[key as string]);
    }
  }
}
