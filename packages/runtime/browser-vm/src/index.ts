import { interfaces } from '@garfish/core';
import type * as Hooks from '@garfish/hooks';
import { warn, isPlainObject } from '@garfish/utils';
import { Module, SandboxOptions } from './types';
import { Sandbox } from './sandbox';
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
      modules?: Array<Module> | Record<string, Module>;
    }

    export interface Config {
      protectVariable?: PropertyKey[];
      insulationVariable?: PropertyKey[];
      sandbox?: false | SandboxConfig;
    }

    export interface App {
      vmSandbox?: Sandbox;
    }

    export interface Plugin {
      openVm?: boolean;
    }

    export interface Plugins {
      'browser-vm': ReturnType<typeof createVMSandboxHooks>;
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
const compatibleOldModulesType = (modules): Array<Module> => {
  if (isPlainObject(modules)) {
    __DEV__ && warn('"vm sandbox" modules should be an array');
    const list = [];
    for (const key in modules) {
      list.push(modules[key]);
    }
    modules = list;
  }
  return [];
};

const createVMSandboxHooks = (Garfish: interfaces.Garfish) => {
  return Garfish.createPluginSystem(({ SyncHook }) => ({
    create: new SyncHook<[number], void>(),
  }));
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

    const hooks = createVMSandboxHooks(Garfish);
    // Use the default Garfish instance attributes
    let config: Partial<SandboxOptions> = { openSandbox: true };

    const options: interfaces.Plugin = {
      hooks,
      openVm: true,
      name: 'browser-vm',
      version: __VERSION__,

      afterLoad(appInfo, appInstance) {
        // Support for instance configuration, to ensure that old versions compatible
        const sandboxConfig = appInfo.sandbox || Garfish?.options?.sandbox;
        if (sandboxConfig === false || sandboxConfig.open === false) {
          config.openSandbox = false;
          options.openVm = false;
          return;
        }

        config = {
          openSandbox: Sandbox.canSupport() && !sandboxConfig?.snapshot,
          modules: compatibleOldModulesType(sandboxConfig?.modules),

          protectVariable: () => [
            ...(Garfish?.options?.protectVariable || []),
            ...(appInfo.protectVariable || []),
          ],
          insulationVariable: () => [
            ...(Garfish?.options?.insulationVariable || []),
            ...(appInfo.insulationVariable || []),
          ],
        };

        options.openVm = config.openSandbox;

        if (!config.openSandbox) return;
        if (appInstance) {
          // Has been initialized sandbox don't need to initialize the again
          if (appInstance.vmSandbox) return;

          // Create sandbox instance
          const sandbox = new Sandbox({
            openSandbox: true,
            namespace: appInfo.name,
            modules: config.modules || [],
            sourceList: appInstance.sourceList,
            baseUrl: appInstance.entryManager.url,
            strictIsolation: appInstance.strictIsolation,
            el: () => appInstance.htmlNode,
            protectVariable: config.protectVariable,
            insulationVariable: () => {
              return webpackAttrs.concat(config.insulationVariable() || []);
            },
          });

          appInstance.vmSandbox = sandbox;
          appInstance.global = sandbox.global;
          // Rewrite `app.runCode`
          // @ts-ignore
          appInstance.runCode = (...args) => sandbox.execScript(...args);

          // Use sandbox document
          if (appInstance.entryManager.DOMApis) {
            appInstance.entryManager.DOMApis.document = sandbox.global.document;
          }

          // Use `Garfish.loader` instead of the `sandbox.loader`
          sandbox.loader = Garfish.loader;
        }
      },

      afterUnmount(appInfo, appInstance) {
        if (appInstance.vmSandbox) {
          // If the app is uninstalled, the sandbox needs to clear all effects and then reset
          appInstance.vmSandbox.reset();
        }
      },

      afterMount(appInfo, appInstance) {
        if (appInstance.vmSandbox) {
          appInstance.vmSandbox.execScript(`
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
