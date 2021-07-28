import { warn } from '@garfish/utils';
import { interfaces } from '@garfish/core';
import { parse } from './parser';
import { stringify } from './stringify';

export { parse, stringify };

export default function CssScope() {
  return function (Garfish: interfaces.Garfish): interfaces.Plugin {
    let changed = false;
    return {
      name: 'css-scope',
      version: __VERSION__,

      beforeBootstrap() {
        if (changed) return;
        changed = true;
        const proto = Garfish.loader.StyleManager.prototype;

        // proto.parseStyleCode = function() {
        //   try {
        //     this.styleCode = parse(this.styleCode);
        //   } catch(e) {
        //     warn(e);
        //   }
        // }

        // proto.getStyleCode = function() {
        //   return ''
        // }
      },
    };
  };
}
