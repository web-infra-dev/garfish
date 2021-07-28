import { interfaces } from '@garfish/core';
import { StyleManager } from '@garfish/loader';
import { parse } from './parser';
import { stringify } from './stringify';

export { parse, stringify };

export default function CssScope() {
  return function (Garfish: interfaces.Garfish): interfaces.Plugin {
    return {
      name: 'css-scope',
      version: __VERSION__,

      beforeBootstrap() {
        Garfish.loader.lifecycle.loaded.add((data) => {
          if (data.value.fileType === 'css' && Garfish.options.cssScope) {
            const manager = data.value.resourceManager as StyleManager;
            manager.getStyleCode = function () {
              console.log(this);
              return '';
            };

            console.log(manager);
          }
          return data;
        });
      },
    };
  };
}
