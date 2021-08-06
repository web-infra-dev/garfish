import { assert, isObject } from '@garfish/utils';
import { interfaces } from '../interface';

export class HooksSystem<T> {
  lifecycle: T;
  plugins: Array<interfaces.Plugin> = [];

  constructor(lifecycle: T) {
    this.lifecycle = lifecycle;
  }

  usePlugins(plugin: interfaces.Plugin) {
    const pluginName = plugin.name;
    const { plugins, lifecycle } = this;
    const lifecycleKeys = Object.keys(lifecycle);

    assert(pluginName, 'Plugin must provide a name');
    assert(isObject(plugin), 'Plugin must return object type.');

    if (!plugins.includes(plugin)) {
      plugins.push(plugin);
    }

    lifecycleKeys.forEach((key) => {
      const pluginLife = plugin[key];
      if (pluginLife) {
        // Differentiate different types of hooks and adopt different registration strategies
        lifecycle[key].add(pluginName, pluginLife);
      }
    });
  }
}
