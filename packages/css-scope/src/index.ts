import { md5 } from 'super-fast-md5';
import type { interfaces } from '@garfish/core';
import type { Loader, StyleManager } from '@garfish/loader';
import {
  warn,
  findTarget,
  supportWasm,
  idleCallback,
  __MockBody__,
} from '@garfish/utils';
import { parse } from './parser';
import { stringify } from './stringify';
import type { StylesheetNode } from './types';

export { parse } from './parser';
export { stringify } from './stringify';

export interface Options {
  fixBodyGetter?: boolean;
  excludes?: Array<string> | ((name: string) => boolean);
}

export function GarfishCssScope(options: Options = {}) {
  const pluginName = 'css-scope';
  const protoCache = new Set<StyleManager>();
  const astCache = new Map<string, StylesheetNode>();

  const disable = (appName?: string) => {
    const { excludes } = options;
    if (!appName) return true;
    if (Array.isArray(excludes)) return excludes.includes(appName);
    if (typeof excludes === 'function') return excludes(appName);
    return false;
  };

  const processPreloadManager = (loader: Loader) => {
    loader.hooks.usePlugin({
      name: pluginName,

      loaded({ value, result }) {
        if (value.fileType === 'css' && !disable(value.scope)) {
          const { styleCode } = value.resourceManager as StyleManager;
          idleCallback(() => {
            const hash = md5(styleCode);
            if (!astCache.has(hash)) {
              const astNode = parse(styleCode, { source: value.url });
              astCache.set(hash, astNode);
            }
          });
        }
        return { value, result };
      },
    });
  };

  return function (Garfish: interfaces.Garfish): interfaces.Plugin {
    const compiledCache = new Set<string>();

    return {
      name: pluginName,
      version: __VERSION__,

      beforeBootstrap() {
        if (!supportWasm) return;
        // When preloading, parse out ast in advance
        processPreloadManager(Garfish.loader);

        // rewrite transform method
        const proto = Garfish.loader.StyleManager.prototype;
        const originTransform = proto.transformCode;
        if (protoCache.has(proto)) return;
        protoCache.add(proto);

        proto.transformCode = function (code: string) {
          const { appName, rootElId } = this.scopeData || {};
          if (
            !code ||
            !rootElId ||
            disable(appName) ||
            compiledCache.has(code)
          ) {
            return originTransform.call(this, code);
          }

          const hash = md5(code);
          let astNode = astCache.get(hash);
          if (!astNode) {
            astNode = parse(code, { source: this.url });
            astCache.set(hash, astNode);
          }
          // The `rootElId` is random, it makes no sense to cache the compiled code
          const newCode = stringify(astNode, rootElId);
          compiledCache.add(newCode);
          return originTransform.call(this, newCode);
        };
      },

      beforeLoad(appInfo) {
        if (!supportWasm) {
          warn('"css-scope" plugin requires webAssembly support');
          return;
        }
        const { name, sandbox } = appInfo;
        if (!disable(name)) {
          if (
            sandbox &&
            (sandbox === false || sandbox.open === false || sandbox.snapshot)
          ) {
            warn(
              `Child app "${name}" does not open the vm sandbox, ` +
                'cannot use "css-scope" plugin',
            );
          }
        }
      },

      afterLoad(appInfo, app) {
        // @ts-ignore
        if (options.fixBodyGetter && !disable(appInfo.name) && app?.vmSandbox) {
          // @ts-ignore
          app.vmSandbox.hooks.usePlugin({
            name: pluginName,
            version: __VERSION__,
            documentGetter(data) {
              if (data.propName === 'body' && data.rootNode) {
                data.customValue = findTarget(data.rootNode, [
                  'body',
                  `div[${__MockBody__}]`,
                ]);
              }
              return data;
            },
          });
        }
      },
    };
  };
}
