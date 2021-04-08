import { SyncHook } from '@garfish/hooks';

type environmentConfig = {
  name?: string;
  say: number;
};

type GarfishConfig = {
  basename: '';
};

interface Lifecycle {
  bootstrap: SyncHook<environmentConfig, environmentConfig>;
  options: SyncHook<GarfishConfig, void>;
  environment: SyncHook<environmentConfig, environmentConfig>;
  beforeLoad: SyncHook<environmentConfig, environmentConfig>;
}

interface Plugin {
  name: string;
  bootstrap?: (config: GarfishConfig) => GarfishConfig;
  options?: (config: GarfishConfig) => void;
  environment?: (config: environmentConfig) => environmentConfig;
  beforeLoad?: (config: environmentConfig) => environmentConfig;
}

export function keys<O>(o: O) {
  return Object.keys(o) as (keyof O)[];
}

class Hooks {
  public lifecycle: Lifecycle;

  constructor() {
    this.lifecycle = {
      bootstrap: new SyncHook(['options']),
      options: new SyncHook(['options']),
      environment: new SyncHook(['config']),
      beforeLoad: new SyncHook(['config']),
    };
  }

  public usePlugins(plugin: Plugin) {
    const lifecycleKeys = keys(plugin);
    lifecycleKeys.forEach((life) => {
      if (life === 'name') return;
      const pluginLife: Plugin[typeof life] = plugin[life];
      if (pluginLife !== undefined) {
        (this.lifecycle[life] as any).tap(plugin.name, pluginLife);
      }
    });
  }
}

export const hooks = new Hooks();
