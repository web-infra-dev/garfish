import SparkMD5 from 'spark-md5';
import { warn } from '@garfish/utils';
import type { interfaces } from '@garfish/core';
import type { Loader, StyleManager } from '@garfish/loader';
import { parse } from './parser';
import { stringify } from './stringify';
import type { StylesheetNode } from './types';

export interface Options {
  excludes?: Array<string> | ((name: string) => boolean);
}

const pluginName = 'css-scope';
const idleCallback = window.requestIdleCallback || window.requestAnimationFrame;

export function GarfishCssScope(options: Options = {}) {
  const spark = new SparkMD5();
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

  let id = 0;
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

          let newCode;
          console.time('tt' + ++id);
          const hash = spark.append(code).end();
          console.timeEnd('tt' + id);
          console.log(hash, 1);

          (async () => {
            const i = id;
            await (window as any).hashwasm.md5('code');
            console.time('ttt' + i);
            const hash = await (window as any).hashwasm.md5(code, 100);
            console.timeEnd('ttt' + i);
            console.log(hash, 2);
          })();

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
          console.timeEnd(appName);
          return originTransform.call(this, newCode);
        };
      },

      async beforeLoad(appInfo) {
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
