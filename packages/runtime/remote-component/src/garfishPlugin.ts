import { warn } from '@garfish/utils';
import { interfaces } from '@garfish/core';
import {
  preload,
  setExternal,
  loadComponent,
  loadComponentSync,
  cacheComponents,
} from './apis';

declare module '@garfish/core' {
  export interface Garfish {
    preload: typeof preload;
    loadComponent: typeof loadComponent;
    loadComponentSync: typeof loadComponentSync;
    cacheComponents: typeof cacheComponents;
  }

  export namespace interfaces {
    export interface Garfish {
      preload: typeof preload;
      loadComponent: typeof loadComponent;
      loadComponentSync: typeof loadComponentSync;
      cacheComponents: typeof cacheComponents;
    }
  }
}

export function remoteComponentPlugin() {
  return (Garfish: interfaces.Garfish): interfaces.Plugin => {
    const warning = () => {
      __DEV__ &&
        warn(
          'If there is no need for performance optimization, ' +
            'you should not use the global component loading method.',
        );
    };

    Garfish.preload = function (urls) {
      warning();
      return preload(urls);
    };

    Garfish.loadComponent = function (options) {
      warning();
      return loadComponent(options);
    };

    Garfish.loadComponentSync = function (options) {
      warning();
      return loadComponentSync(options);
    };

    Garfish.cacheComponents = cacheComponents;

    return {
      name: 'micro-component',
      version: __VERSION__,

      bootstrap() {
        setExternal(Garfish.externals);
      },
    };
  };
}
