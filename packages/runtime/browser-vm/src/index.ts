import Garfish, { interfaces } from '@garfish/core';
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
  };
}

export { Sandbox } from './sandbox';
