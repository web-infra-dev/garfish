import Garfish, { interfaces } from '@garfish/core';
import { assert, warn } from '@garfish/utils';
import { Sandbox } from './sandbox';
import './utils/handleNode';

declare module '@garfish/core' {
  export namespace interfaces {
    export interface Config {
      protectVariable?: PropertyKey[];
      insulationVariable?: PropertyKey[];
    }

    export interface App {
      vmSandbox?: Sandbox;
    }
  }
}

export default function BrowserVm() {
  return function (Garfish: Garfish): interfaces.Plugin {
    return {
      name: 'browser-vm',
      version: __VERSION__,
      afterLoad(appInfo, appInstance) {
        if (appInstance) {
          // existing
          if (appInstance.vmSandbox) return;
          const cjsModule = appInstance.getExecScriptEnv(false);

          // webpack
          const webpackAttrs: PropertyKey[] = [
            'onerror',
            'webpackjsonp',
            '__REACT_ERROR_OVERLAY_GLOBAL_HOOK__',
          ];
          if (__DEV__) {
            webpackAttrs.push('webpackHotUpdate');
          }

          const sandbox = new Sandbox({
            namespace: appInfo.name,
            el: () => appInstance.htmlNode,
            openSandbox: true,
            strictIsolation: appInstance.strictIsolation,
            protectVariable: () => Garfish.options.protectVariable || [],
            insulationVariable: () =>
              webpackAttrs.concat(Garfish.options?.insulationVariable || []),
            modules: {
              cjsModule: () => {
                return {
                  override: {
                    ...cjsModule,
                  },
                };
              },
            },
          });

          appInstance.vmSandbox = sandbox;

          appInstance.execScript = (code, env, url, options) => {
            sandbox.execScript(code, env, url, options);
          };
        }
      },
    };
  };
}
