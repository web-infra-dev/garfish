import { warn, assert, isPlainObject } from '@garfish/utils';

type Plugin<T extends Record<string, any>> = {
  [k in keyof T]?: Parameters<T[k]['on']>[0];
} & {
  name: string;
};

export class PluginSystem<T extends Record<string, any>> {
  lifecycle: T;
  lifecycleKeys: Array<keyof T>;
  private registerPlugins: Record<string, Plugin<T>> = {};

  constructor(lifecycle: T) {
    this.lifecycle = lifecycle;
    this.lifecycleKeys = Object.keys(lifecycle);
  }

  usePlugin(plugin: Plugin<T>) {
    assert(isPlainObject(plugin), 'Invalid plugin configuration.');
    // Plugin name is required and unique
    const pluginName = plugin.name;
    assert(pluginName, 'Plugin must provide a name.');

    if (!this.registerPlugins[pluginName]) {
      this.registerPlugins[pluginName] = plugin;

      for (const key in this.lifecycle) {
        const pluginLife = plugin[key as string];
        if (pluginLife) {
          // Differentiate different types of hooks and adopt different registration strategies
          this.lifecycle[key].on(pluginLife);
        }
      }
    } else if (__DEV__) {
      warn(`Repeat to register plugin hooks "${pluginName}".`);
    }
  }

  removePlugin(pluginName) {
    assert(pluginName, 'Must provide a name.');
    const plugin = this.registerPlugins[pluginName];
    assert(plugin, `plugin "${pluginName}" is not registered.`);

    for (const key in plugin) {
      this.lifecycle[key].remove(plugin[key as string]);
    }
  }
}
