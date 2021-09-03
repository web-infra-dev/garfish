import { interfaces } from '@garfish/core';
import type * as Hooks from '@garfish/hooks';
import { warn, isPlainObject } from '@garfish/utils';
import { Module } from './types';
import { Sandbox } from './sandbox';

declare module '@garfish/core' {
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

    export interface Plugins {
      'browser-vm': ReturnType<typeof createHooks>;
    }
  }
}

// Strongly isolated webpack attributes
const webpackAttrs: PropertyKey[] = [
  'onerror',
  'webpackjsonp',
  '__REACT_ERROR_OVERLAY_GLOBAL_HOOK__',
  __DEV__ ? 'webpackHotUpdate' : '',
];

function compatibleOldModule(modules) {
  if (isPlainObject(modules)) {
    __DEV__ && warn('"vm sandbox" modules should be an array');
    const list = [];
    for (const key in modules) {
      list.push(modules[key]);
    }
    modules = list;
  }
  return modules as Array<Module>;
}

function createHooks(Garfish: interfaces.Garfish) {
  return Garfish.createPluginSystem(({ SyncHook }) => ({
    appendNode: new SyncHook<[Sandbox, Element], void>(),
  }));
}

function rewriteAppAndSandbox(
  Garfish: interfaces.Garfish,
  app: interfaces.App,
  sandbox: Sandbox,
) {
  const originExecScript = sandbox.execScript;
  // Rewrite sandbox attributes
  sandbox.loader = Garfish.loader;
  sandbox.execScript = (code, env, url, options) => {
    return originExecScript.call(
      sandbox,
      code,
      {
        // For application of environment variables
        ...env,
        ...app.getExecScriptEnv(false),
      },
      url,
      options,
    );
  };
  // Rewrite app attributes
  app.vmSandbox = sandbox;
  app.global = sandbox.global;
  app.runCode = function () {
    return originExecScript.apply(sandbox, arguments);
  };
  if (app.entryManager.DOMApis) {
    app.entryManager.DOMApis.document = sandbox.global.document;
  }
}

function createOptions(Garfish: interfaces.Garfish) {
  const hooks = createHooks(Garfish);
  const canSupport = Sandbox.canSupport();

  const options: interfaces.Plugin = {
    hooks,
    name: 'browser-vm',
    version: __VERSION__,

    afterLoad(appInfo, appInstance) {
      if (
        !canSupport ||
        !appInstance ||
        appInfo.sandbox === false || // Ensure that old versions compatible
        appInfo.sandbox.open === false ||
        appInfo.sandbox.snapshot
      ) {
        return;
      }

      rewriteAppAndSandbox(
        Garfish,
        appInstance,
        new Sandbox({
          openSandbox: true,
          namespace: appInfo.name,
          sourceList: appInstance.sourceList,
          baseUrl: appInstance.entryManager.url,
          strictIsolation: appInstance.strictIsolation,
          modules: compatibleOldModule(appInfo.sandbox.modules),

          el: () => appInstance.htmlNode,

          insulationVariable: () => {
            return [
              ...webpackAttrs,
              ...(appInfo.insulationVariable || []),
            ].filter(Boolean);
          },

          protectVariable: () => {
            return [
              ...(appInfo.protectVariable || []),
              ...(appInstance &&
                Object.keys(appInstance.getExecScriptEnv(false) || [])),
            ].filter(Boolean);
          },
        }),
      );
    },

    // If the app is uninstalled, the sandbox needs to clear all effects and then reset
    afterUnmount(_, appInstance) {
      if (!appInstance.vmSandbox) return;
      appInstance.vmSandbox.reset();
    },

    afterMount(_, appInstance) {
      if (!appInstance.vmSandbox) return;
      appInstance.vmSandbox.execScript(`
        if (typeof window.onload === 'function') {
          window.onload.call(window);
        }
      `);
    },
  };
  return options;
}

// Export Garfish plugin
export function GarfishBrowserVm() {
  return function (Garfish: interfaces.Garfish): interfaces.Plugin {
    Garfish.getGlobalObject = function () {
      return Sandbox.getNativeWindow();
    };

    Garfish.setGlobalValue = function (key, value) {
      return (this.getGlobalObject()[key] = value);
    };

    Garfish.clearEscapeEffect = function (key, value) {
      const global = this.getGlobalObject();
      if (key in global) {
        global[key] = value;
      }
    };
    return createOptions(Garfish);
  };
}
