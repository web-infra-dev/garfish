import { interfaces } from '@garfish/core';
import { rawWindow, sourceNode } from '@garfish/utils';
import { Sandbox } from './sandbox';
import { BrowserConfig, Hooks as TypeHooks } from './types';
import './utils/handleNode';

export interface OverridesData {
  recover?: () => void;
  override?: Record<string, any>;
  created?: (context: Sandbox['context']) => void;
}

declare module '@garfish/core' {
  export interface Garfish {
    getGlobalObject: () => Window & typeof globalThis;
    setGlobalValue(key: string, value?: any): void;
    clearEscapeEffect: (key: string, value?: any) => void;
  }

  export namespace interfaces {
    export interface Garfish {
      getGlobalObject: () => Window & typeof globalThis;
      setGlobalValue(key: string, value?: any): void;
      clearEscapeEffect: (key: string, value?: any) => void;
    }

    export interface SandboxConfig {
      hooks?: TypeHooks;
      modules?: Record<string, (sandbox: Sandbox) => OverridesData>;
    }

    export interface Config {
      protectVariable?: PropertyKey[];
      insulationVariable?: PropertyKey[];
      sandbox?: SandboxConfig;
    }

    // export interface App {
    //   vmSandbox?: Sandbox;
    // }
    export interface Plugin {
      openVm?: boolean;
    }
  }
}

export default function BrowserVm() {
  return function (Garfish: interfaces.Garfish): interfaces.Plugin {
    // Use the default Garfish instance attributes
    let config: BrowserConfig = { open: true };
    Garfish.getGlobalObject = () => Sandbox.getGlobalObject();
    Garfish.setGlobalValue = (key, value) =>
      (Garfish.getGlobalObject()[key] = value);
    Garfish.clearEscapeEffect = (key, value?: any) => {
      const global = Garfish.getGlobalObject();
      if (key in global) {
        global[key] = value;
      }
    };

    const options = {
      name: 'browser-vm',
      version: __VERSION__,
      openVm: true,
      bootstrap() {
        // Support for instance configuration, to ensure that old versions compatible
        const sandboxConfig = Garfish?.options?.sandbox;
        if (sandboxConfig === false) config.open = false;
        if (sandboxConfig) {
          config = {
            open:
              rawWindow.Proxy &&
              sandboxConfig?.open &&
              sandboxConfig?.snapshot === false,
            protectVariable: Garfish?.options?.protectVariable || [],
            insulationVariable: Garfish?.options?.insulationVariable || [],
            modules: sandboxConfig.modules || {},
            hooks: sandboxConfig.hooks || {},
          };
        }
        options.openVm = config.open;
      },
      // Get all the application resources of static address, used to distinguish whether the error is derived from the application
      // processResource(appInfo, manager, _resource) {
      //   const sourceList = [];
      //   sourceListTags.forEach((tag) => {
      //     manager.getVNodesByTagName(tag).forEach((node) => {
      //       const url = findProp(node, 'href') || findProp(node, 'src');
      //       if (url && url.value) {
      //         sourceList.push(transformUrl(manager.opts.url, url.value));
      //       }
      //     });
      //   });
      //   appSourceList.set(appInfo.name, sourceList);
      // },
      afterLoad(appInfo, appInstance) {
        if (!config.open) return;

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
            protectVariable: () => config.protectVariable || [],
            insulationVariable: () =>
              webpackAttrs.concat(config?.insulationVariable || []),
            modules: {
              cjsModule: () => {
                return {
                  override: {
                    ...cjsModule,
                  },
                };
              },
            },
            hooks: {
              onAppendNode(sandbox, rootEl, el, tag, oldEl) {
                if (sourceNode(tag)) {
                  const url = (oldEl as any)?.src || (oldEl as any)?.href;
                  url && appInstance.sourceList.push(url);
                }
              },
            },
          });

          appInstance.vmSandbox = sandbox;
          appInstance.global = sandbox.context;

          appInstance.execScript = (code, env, url, options) => {
            sandbox.execScript(code, env, url, options);
          };
        }
      },
    };
    return options;
  };
}

export { Sandbox } from './sandbox';
export { Hooks } from './types';
