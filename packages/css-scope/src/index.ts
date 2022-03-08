import { warn } from '@garfish/utils';
import type { interfaces } from '@garfish/core';
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
  const astCache = new Map<number, StylesheetNode>();
  const idleCallback =
    window.requestIdleCallback || window.requestAnimationFrame;

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
          const { id, styleCode } = value.resourceManager as StyleManager;
          idleCallback(() => {
            if (!astCache.has(id)) {
              const astNode = parse(styleCode, { source: value.url });
              astCache.set(id, astNode);
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

          let astNode = astCache.get(this.id);
          if (!astNode) {
            astNode = parse(code, { source: this.url });
            astCache.set(this.id, astNode);
          }
          const newCode = stringify(astNode, `#${rootElId}`);
          return originTransform.call(this, newCode);
        };
      },

      beforeLoad(appInfo) {
        if (__DEV__) {
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
