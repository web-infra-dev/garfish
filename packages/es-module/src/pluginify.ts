import { evalWithEnv } from '@garfish/utils';
import type { interfaces } from '@garfish/core';
import { Runtime } from './runtime';

export interface Options {
  excludes?: Array<string> | ((name: string) => boolean);
}

export function GarfishEsModule(options: Options = {}) {
  return function (Garfish: interfaces.Garfish): interfaces.Plugin {
    const appModules = {};
    const { excludes } = options;

    const disable = (
      appId: number,
      appName: string,
      appInfo: interfaces.AppInfo,
    ) => {
      if (appModules[appId]) return true;
      if (Array.isArray(excludes)) return excludes.includes(appName);
      if (typeof excludes === 'function') return excludes(appName);
      if (appInfo.sandbox === false || appInfo.sandbox.open === false) {
        return true;
      }
      return false;
    };

    return {
      name: 'es-module',

      afterLoad(appInfo, appInstance) {
        const { appId, name } = appInstance;
        if (!disable(appId, name, appInfo)) {
          // @ts-ignore
          const sandbox = appInstance.vmSandbox;
          const runtime = new Runtime({ scope: name });

          appModules[appId] = runtime;
          runtime.loader = Garfish.loader;

          appInstance.runCode = function (
            code: string,
            env: Record<string, any>,
            url?: string,
            options?: interfaces.ExecScriptOptions,
          ) {
            const appEnv = appInstance.getExecScriptEnv(options?.noEntry);
            Object.assign(env, appEnv);

            if (options.isModule) {
              const codeRef = { code };

              runtime.options.execCode = function (output, provider) {
                const sourcemap = `\n//@ sourceMappingURL=${output.map}`;
                Object.assign(env, provider);
                codeRef.code = `(() => {'use strict';${output.code}})()`;

                sandbox.hooks.lifecycle.beforeInvoke.emit(
                  codeRef,
                  url,
                  env,
                  options,
                );

                try {
                  const params = sandbox.createExecParams(codeRef, env);
                  const code = `${codeRef.code}\n//${output.storeId}${sourcemap}`;
                  evalWithEnv(code, params, undefined, false);
                } catch (e) {
                  sandbox.processExecError(e, url, env, options);
                }

                sandbox.hooks.lifecycle.afterInvoke.emit(
                  codeRef,
                  url,
                  env,
                  options,
                );
              };

              appInstance.esmQueue.add(async (next) => {
                options.isInline
                  ? await runtime.importByCode(codeRef.code, url)
                  : await runtime.importByUrl(url, url);
                next();
              });
            } else {
              sandbox.execScript(code, env, url, options);
            }
          };
        }
      },

      afterUnmount(appInfo, appInstance, isCacheMode) {
        if (!isCacheMode) {
          appModules[appInstance.appId] = null;
        }
      },
    };
  };
}
