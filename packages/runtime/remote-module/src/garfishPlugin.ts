import { warn } from '@garfish/utils';
import { interfaces } from '@garfish/core';
import { cacheModules } from './common';
import { loadModule } from './apis/loadModule';
import { setModuleAlias } from './apis/setModuleAlias';
import { setModuleExternal } from './apis/setModuleExternal';

declare module '@garfish/core' {
  export interface Garfish {
    loadModule: typeof loadModule;
    setModuleAlias: typeof setModuleAlias;
    cacheModules: typeof cacheModules;
  }

  export namespace interfaces {
    export interface Garfish {
      loadModule: typeof loadModule;
      setModuleAlias: typeof setModuleAlias;
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

    Garfish.setModuleAlias = function (...args) {
      return setModuleAlias(...args);
    };

    return {
      name: 'remote-module',
      version: __VERSION__,
      bootstrap() {
        setModuleExternal(Garfish.externals);
      },
    };
  };
}
