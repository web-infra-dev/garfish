import { interfaces } from '@garfish/core';
import {
  assert,
  findProp,
  sourceListTags,
  sourceNode,
  transformUrl,
  warn,
} from '@garfish/utils';
import { Sandbox } from './sandbox';
import './utils/handleNode';

export interface SandboxConfig {
  open?: boolean;
  snapshot?: boolean;
  useStrict?: boolean;
  strictIsolation?: boolean;
}

declare module '@garfish/core' {
  export namespace interfaces {
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

interface Options {
  open: false;
}

export default function BrowserVm() {
  return function (Garfish: interfaces.Garfish): interfaces.Plugin {
    let openVm = false;
    const options = {
      name: 'browser-vm',
      version: __VERSION__,
      openVm: true,
      bootstrap() {
        if (Garfish?.options?.sandbox === false) options.openVm = false;
        if (Garfish?.options?.sandbox) {
          // Support for instance configuration, to ensure that old versions compatible
          const noSandbox = Garfish?.options?.sandbox?.open === false;
          const useBrowserVm = Garfish?.options?.sandbox?.snapshot === false;
          openVm = !noSandbox && window.Proxy && useBrowserVm;
          options.openVm = openVm;
        }
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
        if (!openVm) return;
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
