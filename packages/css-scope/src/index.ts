import { md5 } from 'super-fast-md5';
import type { interfaces } from '@garfish/core';
import { warn, supportWasm, idleCallback } from '@garfish/utils';
import type { Loader, StyleManager } from '@garfish/loader';
import { parse } from './parser';
import { stringify } from './stringify';
import type { StylesheetNode } from './types';

export interface Options {
  excludes?: Array<string> | ((name: string) => boolean);
}

export function GarfishCssScope(options: Options = {}) {
  const pluginName = 'css-scope';
  const protoCache = new Set<StyleManager>();
  const codeCache = new Map<string, string>();
  const astCache = new Map<string, StylesheetNode>();

  const disable = (appName: string) => {
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
        if (value.url && value.fileType === 'css' && !disable(value.scope)) {
          const { styleCode } = value.resourceManager as StyleManager;
          idleCallback(() => {
            if (!astCache.has(value.url)) {
              const astNode = parse(styleCode, { source: value.url });
              astCache.set(value.url, astNode);
            }
          });
        }
        return { value, result };
      },
    });
  };

  return function (Garfish: interfaces.Garfish): interfaces.Plugin {
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
          if (!code || !rootElId || disable(appName)) {
            return originTransform.call(this, code);
          }

          let newCode;
          const hash = md5(code);

          if (codeCache.has(hash)) {
            newCode = codeCache.get(hash);
          } else {
            let astNode = astCache.get(this.url);
            if (!astNode) {
              astNode = parse(code, { source: this.url });
            }
            newCode = stringify(astNode, `#${rootElId}`);
            codeCache.set(hash, newCode);
          }
          return originTransform.call(this, newCode);
        };
      },

      async beforeLoad(appInfo) {
        if (__DEV__) {
          if (!supportWasm) {
            warn('"css-scope" plugin requires webAssembly support');
            return;
          }
          const { name, sandbox } = appInfo;
          if (!disable(name)) {
            if (
              sandbox === false ||
              sandbox.open === false ||
              sandbox.snapshot
            ) {
              warn(
                `Child app "${name}" does not open the vm sandbox, ` +
                  'cannot use "css-scope" plugin',
              );
            }
          }
        }
      },
    };
  };
}
