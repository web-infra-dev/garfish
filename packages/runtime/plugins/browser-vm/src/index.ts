import Garfish, { interfaces } from '@garfish/core';
import { assert, warn } from '@garfish/utils';
import { Sandbox } from './sandbox';

// declare module '@garfish/core' {
//   export default interface Garfish {
//     setExternal: (
//       nameOrExtObj: string | Record<string, any>,
//       value?: any,
//     ) => void;
//     externals: Record<string, any>;
//   }
// }

export default function BrowserVm(_Garfish: Garfish): interfaces.Plugin {
  return {
    name: 'browser-vm',
    afterLoad(appInfo, appInstance) {
      if (appInstance) {
        const sandbox = new Sandbox({
          namespace: appInfo.name,
          // modules: appInstance.cjsModules
        });
        appInstance.execScript = (code, env, url, _options) => {
          sandbox.execScript(code, url);
        };
      }
    },
  };
}
