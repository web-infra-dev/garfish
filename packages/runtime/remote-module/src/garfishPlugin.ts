import { warn } from '@garfish/utils';
import { interfaces } from '@garfish/core';
import { cacheModules } from './common';
import { loadModule } from './apis/loadModule';
import { setModuleConfig } from './apis/setModuleConfig';

declare module '@garfish/core' {
  export interface Garfish {
    loadModule: typeof loadModule;
    setModuleConfig: typeof setModuleConfig;
    cacheModules: typeof cacheModules;
  }

  export namespace interfaces {
    export interface Garfish {
      loadModule: typeof loadModule;
      setModuleConfig: typeof setModuleConfig;
      cacheModules: typeof cacheModules;
    }
  }
}

export function GarfishRemoteModulePlugin() {
  return (Garfish: interfaces.Garfish): interfaces.Plugin => {
    Garfish.cacheModules = cacheModules;

    Garfish.loadModule = function (...args) {
      __DEV__ &&
        warn(
          'If there is no need for performance optimization, ' +
            'you should not use the `Garfish.loadModule()`.',
        );
      return loadModule(...args);
    };

    Garfish.setModuleConfig = function (...args) {
      return setModuleConfig(...args);
    };

    return {
      name: 'remote-module',
      version: __VERSION__,
      bootstrap() {
        setModuleConfig({
          externals: Garfish.externals,
        });
      },
    };
  };
}
