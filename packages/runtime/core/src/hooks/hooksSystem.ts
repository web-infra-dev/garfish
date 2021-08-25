import { assert, isObject } from '@garfish/utils';
import { SyncHook } from './SyncHook';
import { interfaces } from '../interface';
import { AsyncSeriesBailHook } from './asyncSeriesBailHook';

export class HooksSystem<
  T extends Record<string, SyncHook | AsyncSeriesBailHook>
> {
  type: string;
  lifecycle: T;
  plugins: Array<interfaces.Plugin> = [];

  private lifecycleKeys: Array<keyof T>;

  constructor(type: string, lifecycle: T) {
    this.type = type;
    this.lifecycle = lifecycle;
    this.lifecycleKeys = Object.keys(lifecycle);
  }

  isApp(key: string) {
    return this.type === 'app' && this.lifecycleKeys.includes(key);
  }

  isGlobal(key: string) {
    return this.type === 'global' && this.lifecycleKeys.includes(key);
  }

  usePlugins(plugin: interfaces.Plugin) {
    const pluginName = plugin.name;
    const { plugins, lifecycle } = this;

    assert(pluginName, 'Plugin must provide a name');
    assert(isObject(plugin), 'Plugin must return object type.');

    if (!plugins.includes(plugin)) {
      plugins.push(plugin);
    }

    for (const key in lifecycle) {
      const pluginLife = plugin[key as string];
      if (pluginLife) {
        // Differentiate different types of hooks and adopt different registration strategies
        lifecycle[key].add(pluginName, pluginLife);
      }
    }
  }
}
