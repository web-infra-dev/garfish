import { error } from '@garfish/utils';
import { interfaces } from '@garfish/core';
import { Runtime } from './runtime';

// Export Garfish plugin
export function GarfishEsmModule() {
  return function (Garfish: interfaces.Garfish): interfaces.Plugin {
    let isCloseSandbox = false;
    const appModules = {};

    return {
      name: 'es-module',

      beforeBootstrap(options) {
        if (!options.sandbox || !options.sandbox.open) {
          isCloseSandbox = true;
        } else if (options.sandbox.snapshot) {
          error('"es-module" plugin only supports "vm sandbox"');
        }
      },

      afterLoad(appInfo, appInstance) {
        if (isCloseSandbox) return;
        if (!appModules[appInfo.name]) {
          appModules[appInfo.name] = new Runtime({
            scope: appInfo.name,
            loader: Garfish.loader,
            execCode(output, provider) {
              console.log(output, provider, appInstance);
            },
          });
        }
      },

      afterUnmount(appInfo, appInstance, isCacheMode) {
        if (!isCacheMode) {
          appModules[appInfo.name] = null;
        }
      },
    };
  };
}
