import { warn } from '@garfish/utils';
import { interfaces } from '@garfish/core';
import { cacheModules } from './common';
import { preload } from './apis/preload';
import { loadModule } from './apis/loadModule';
import { setExternal } from './apis/setExternal';
import { loadModuleSync } from './apis/loadModuleSync';

declare module '@garfish/core' {
  export interface Garfish {
    preload: typeof preload;
    loadModule: typeof loadModule;
    loadModuleSync: typeof loadModuleSync;
    cacheModules: typeof cacheModules;
  }

  export namespace interfaces {
    export interface Garfish {
      preload: typeof preload;
      loadModule: typeof loadModule;
      loadModuleSync: typeof loadModuleSync;
      cacheModules: typeof cacheModules;
    }
  }
}

export function GarfishRemoteModulePlugin() {
  return (Garfish: interfaces.Garfish): interfaces.Plugin => {
    const warning = () => {
      __DEV__ &&
        warn(
          'If there is no need for performance optimization, ' +
            'you should not use the `Garfish.loadModule()`.',
        );
    };

    Garfish.preload = function (urls) {
      warning();
      return preload(urls);
    };

    Garfish.loadModule = function (options) {
      warning();
      return loadModule(options);
    };

    Garfish.loadModuleSync = function (options) {
      warning();
      return loadModuleSync(options);
    };

    Garfish.cacheModules = cacheModules;

    return {
      name: 'remote-module',
      version: __VERSION__,

      bootstrap() {
        setExternal(Garfish.externals);
      },
    };
  };
}
