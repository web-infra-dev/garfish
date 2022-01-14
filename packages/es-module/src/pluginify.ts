import { error, evalWithEnv } from '@garfish/utils';
import type { interfaces } from '@garfish/core';
import { Runtime } from './runtime';

export interface Options {
  excludes?: Array<string> | ((name: string) => boolean);
}

// Export Garfish plugin
export function GarfishEsmModule(options: Options = {}) {
  return function (Garfish: interfaces.Garfish): interfaces.Plugin {
    let closeSandbox = false;
    const appModules = {};
    const { excludes } = options;
    const pluginName = 'es-module';

    const disable = (appId: number, appName: string) => {
      if (closeSandbox || appModules[appId]) {
        return true;
      } else if (Array.isArray(excludes)) {
        return excludes.includes(appName);
      } else if (typeof excludes === 'function') {
        return excludes(appName);
      }
      return false;
    };

    return {
      name: pluginName,

      beforeBootstrap(options) {
        if (!options.sandbox || !options.sandbox.open) {
          closeSandbox = true;
        } else if (options.sandbox.snapshot) {
          // `Garfish/core` by default supports esm with closed sandbox and esm with snapshot sandbox
          error('"es-module" plugin only supports "vm sandbox"');
        }
      },

      afterLoad(appInfo, appInstance) {
        const { appId, name } = appInstance;
        if (!disable(appId, name)) {
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
                  : await runtime.dynamicImport(url, url);
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
