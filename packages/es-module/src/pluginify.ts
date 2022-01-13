import { error, evalWithEnv } from '@garfish/utils';
import { interfaces } from '@garfish/core';
import { Runtime } from './runtime';

// Export Garfish plugin
export function GarfishEsmModule() {
  return function (Garfish: interfaces.Garfish): interfaces.Plugin {
    let isCloseSandbox = false;
    const appModules = {};
    const pluginName = 'es-module';

    return {
      name: pluginName,

      beforeBootstrap(options) {
        if (!options.sandbox || !options.sandbox.open) {
          isCloseSandbox = true;
        } else if (options.sandbox.snapshot) {
          error('"es-module" plugin only supports "vm sandbox"');
        }
      },

      afterLoad(appInfo, appInstance) {
        if (isCloseSandbox) return;
        if (!appModules[appInstance.appId]) {
          // @ts-ignore
          const sandbox = appInstance.vmSandbox;
          const runtime = new Runtime({
            scope: appInfo.name,
          });

          runtime.loader = Garfish.loader;
          appModules[appInstance.appId] = runtime;

          appInstance.runCode = function (
            code: string,
            env: Record<string, any>,
            url?: string,
            options?: interfaces.ExecScriptOptions,
          ) {
            if (!options.isModule) {
              return sandbox.execScript(code, env, url, options);
            }
            const codeRef = { code };

            runtime.options.execCode = function (output, provider) {
              codeRef.code = `(() => {'use strict';${output.code}})()`;

              sandbox.hooks.lifecycle.beforeInvoke.emit(
                codeRef,
                url,
                env,
                options,
              );

              const appEnv = appInstance.getExecScriptEnv(options?.noEntry);
              Object.assign(env, appEnv, provider);
              const params = sandbox.createExecParams(codeRef, env);

              try {
                const sourcemap = `\n//@ sourceMappingURL=${output.map}`;
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
              await runtime.asyncImport(url, url);
              next();
            });
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
