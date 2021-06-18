import { interfaces } from '@garfish/core';
import { Sandbox } from './sandbox';
import { SandboxOptions } from './types';
import './utils/handleNode';

declare module '@garfish/core' {
  // This type declaration is used to extend garfish core
  export interface Garfish {
    getGlobalObject: () => Window & typeof globalThis;
    setGlobalValue(key: string, value?: any): void;
    clearEscapeEffect: (key: string, value?: any) => void;
  }

  export namespace interfaces {
    export interface Garfish {
      setGlobalValue(key: string, value?: any): void;
      getGlobalObject: () => Window & typeof globalThis;
      clearEscapeEffect: (key: string, value?: any) => void;
    }

    export interface Config {
      protectVariable?: PropertyKey[];
      insulationVariable?: PropertyKey[];
      sandbox?: SandboxConfig;
    }

    export interface App {
      vmSandbox?: Sandbox;
    }

    export interface Plugin {
      openVm?: boolean;
    }
  }
}

// Default export Garfish plugin
export default function BrowserVm() {
  return function (Garfish: interfaces.Garfish): interfaces.Plugin {
    // Garfish apis
    Garfish.getGlobalObject = () => {
      return Sandbox.getNativeWindow();
    };

    Garfish.setGlobalValue = (key, value) => {
      return (Garfish.getGlobalObject()[key] = value);
    };

    Garfish.clearEscapeEffect = (key, value?: any) => {
      const global = Garfish.getGlobalObject();
      if (key in global) global[key] = value;
    };

    // Use the default Garfish instance attributes
    let config: Partial<SandboxOptions> = { openSandbox: true };
    const options = {
      openVm: true,
      name: 'browser-vm',
      version: __VERSION__,

      bootstrap() {
        // Support for instance configuration, to ensure that old versions compatible
        const sandboxConfig = Garfish?.options?.sandbox;
        if (sandboxConfig === false) {
          config.openSandbox = false;
        }

        if (sandboxConfig) {
          console.log(sandboxConfig, 'sandboxConfig');
          config = {
            openSandbox:
              sandboxConfig?.open && sandboxConfig?.snapshot === false,
            protectVariable: () => Garfish?.options?.protectVariable,
            insulationVariable: () => Garfish?.options?.insulationVariable,
          };
        }
        options.openVm = config.openSandbox;
      },

      afterLoad(appInfo, appInstance) {
        if (!config.openSandbox || !appInstance || appInstance.vmSandbox) {
          return;
        }
        // Create sandbox instance
        const sandbox = new Sandbox({
          openSandbox: true,
          namespace: appInfo.name,
          el: () => appInstance.htmlNode,
          strictIsolation: appInstance.strictIsolation,
          protectVariable: config.protectVariable,
          insulationVariable: () => {
            // webpack
            const webpackAttrs: PropertyKey[] = [
              'onerror',
              'webpackjsonp',
              '__REACT_ERROR_OVERLAY_GLOBAL_HOOK__',
            ];
            if (__DEV__) {
              webpackAttrs.push('webpackHotUpdate');
            }
            return webpackAttrs.concat(config.insulationVariable() || []);
          },
          modules: [
            () => ({
              override: appInstance.getExecScriptEnv(false) || {},
            }),
          ],
          // hooks: {
          //   onAppendNode(sandbox, rootEl, el, tag, oldEl) {
          //     if (sourceNode(tag)) {
          //       const url = (oldEl as any)?.src || (oldEl as any)?.href;
          //       url && appInstance.sourceList.push(url);
          //     }
          //   },
          // },
        });

        appInstance.vmSandbox = sandbox;
        appInstance.global = sandbox.global;
        // Rewrite `app.execScript`
        appInstance.execScript = (code, env, url, options) => {
          sandbox.execScript(code, env, url, options);
        };
      },
    };
    return options;
  };
}

export { Sandbox } from './sandbox';
