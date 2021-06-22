import { interfaces } from '@garfish/core';
import { warn, isPlainObject } from '@garfish/utils';
import { Sandbox } from './sandbox';
import { Module, SandboxOptions } from './types';
export { Sandbox } from './sandbox';

// export declare module
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

    export interface SandboxConfig {
      modules?: Array<Module>;
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

// Strongly isolated webpack attributes
const webpackAttrs: PropertyKey[] = [
  'onerror',
  'webpackjsonp',
  '__REACT_ERROR_OVERLAY_GLOBAL_HOOK__',
];
if (__DEV__) {
  webpackAttrs.push('webpackHotUpdate');
}

// Compatible with old code
const compatibleOldModulesType = (config) => {
  if (isPlainObject(config.modules)) {
    __DEV__ && warn('"vm sandbox" modules should be an array');
    const list = [];
    for (const key in config.modules) {
      list.push(config.modules[key]);
    }
    config.modules = list;
  }
};

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
      someting: 'hello world',

      afterLoad(appInfo, appInstance) {
        // Support for instance configuration, to ensure that old versions compatible
        const sandboxConfig = appInfo.sandbox || Garfish?.options?.sandbox;
        if (sandboxConfig === false) {
          config.openSandbox = false;
        }

        if (sandboxConfig) {
          config = {
            openSandbox:
              Sandbox.canSupport() &&
              sandboxConfig.open &&
              !sandboxConfig.snapshot,
            modules: sandboxConfig.modules || [],

            protectVariable: () => [
              ...(Garfish?.options?.protectVariable || []),
              ...(appInfo.protectVariable || []),
            ],
            insulationVariable: () => [
              ...(Garfish?.options?.insulationVariable || []),
              ...(appInfo.insulationVariable || []),
            ],
          };
        }
        options.openVm = config.openSandbox;

        if (!config.openSandbox) return;
        if (appInstance) {
          if (appInstance.vmSandbox) return;

          compatibleOldModulesType(config);
          // Create sandbox instance
          const sandbox = new Sandbox({
            openSandbox: true,
            namespace: appInfo.name,
            strictIsolation: appInstance.strictIsolation,
            sourceList: appInstance.sourceList,
            modules: [
              () => ({
                override: appInstance.getExecScriptEnv(false) || {},
              }),
              ...(config.modules || []),
            ],

            el: () => appInstance.htmlNode,
            protectVariable: config.protectVariable,
            insulationVariable: () => {
              return webpackAttrs.concat(config.insulationVariable() || []);
            },
          });

          appInstance.vmSandbox = sandbox;
          appInstance.global = sandbox.global;
          // Rewrite `app.execScript`
          appInstance.execScript = (code, env, url, options) => {
            sandbox.execScript(code, env, url, options);
          };
          // Use `Garfish.loader` instead of the `sandbox.loader`
          sandbox.loader = Garfish.loader;
        }
      },

      afterUnMount(appInfo, appInstance) {
        if (appInstance.vmSandbox) {
          // If the app is uninstalled,
          // the sandbox needs to clear all effects and then reset
          appInstance.vmSandbox.reset();
        }
      },

      afterMount(appInfo, appInstance) {
        if (appInstance.vmSandbox) {
          (appInstance.vmSandbox as Sandbox).execScript(`
            if (typeof window.onload === 'function') {
              window.onload.call(window);
            }
          `);
        }
      },
    };
    return options;
  };
}
