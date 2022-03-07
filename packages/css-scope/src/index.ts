import type { interfaces } from '@garfish/core';
import type { StyleManager } from '@garfish/loader';
import { parse } from './parser';
import { stringify } from './stringify';

export interface Options {
  excludes?: Array<string> | ((name: string) => boolean);
}

export function GarfishCssScope(options: Options = {}) {
  const protoCache = new Set<StyleManager>();
  const codeCache = new Map<string, string>();

  const disable = (appName: string) => {
    const { excludes } = options;
    if (Array.isArray(excludes)) return excludes.includes(appName);
    if (typeof excludes === 'function') return excludes(appName);
    return false;
  };

  return function (Garfish: interfaces.Garfish): interfaces.Plugin {
    return {
      name: 'css-scope',
      version: __VERSION__,

      beforeBootstrap() {
        const proto = Garfish.loader.StyleManager.prototype;
        if (!protoCache.has(proto)) {
          protoCache.add(proto);

          proto.transformCode = function (code: string) {
            if (!code || !this.appName || disable(this.appName)) {
              return code;
            } else {
              const astNode = parse(code, { source: this.url });
              const newCode = stringify(
                astNode,
                `div[id^=garfish_app_for_${this.appName}_]`,
              );
              codeCache.set(code, newCode);
              return newCode;
            }
          };
        }
      },
    };
  };
}
