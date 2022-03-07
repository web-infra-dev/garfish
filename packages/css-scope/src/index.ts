import type { interfaces } from '@garfish/core';
import type { StyleManager } from '@garfish/loader';
import { parse } from './parser';
import { stringify } from './stringify';

export interface Options {
  excludes?: Array<string> | ((name: string) => boolean);
}

const pluginName = 'css-scope';

export function GarfishCssScope(options: Options = {}) {
  return function (Garfish: interfaces.Garfish): interfaces.Plugin {
    const disable = (appName: string) => {
      const { excludes } = options;
      if (Array.isArray(excludes)) return excludes.includes(appName);
      if (typeof excludes === 'function') return excludes(appName);
      return true;
    };

    return {
      name: pluginName,
      version: __VERSION__,

      beforeBootstrap() {
        const loader = Garfish.loader;
        loader.hooks.usePlugin({
          name: pluginName,

          loaded(data) {
            const { scope, fileType } = data.value;
            console.log(scope, fileType);
            if (fileType === 'css' && !disable(scope)) {
              const manager = data.value.resourceManager as StyleManager;
              console.log(manager);
            }
            return data;
          },
        });
      },
    };
  };
}
