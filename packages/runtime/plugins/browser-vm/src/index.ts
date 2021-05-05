import Garfish, { interfaces } from '@garfish/core';
import { assert, warn } from '@garfish/utils';
import { Sandbox } from './sandbox';
import './utils/handleNode';

export default function BrowserVm(_Garfish: Garfish): interfaces.Plugin {
  return {
    name: 'browser-vm',
    afterLoad(appInfo, appInstance) {
      if (appInstance) {
        // existing
        if ((appInstance as any).sandbox) return;
        const cjsModule = appInstance.getExecScriptEnv(false);

        const sandbox = new Sandbox({
          namespace: appInfo.name,
          el: () => appInstance.htmlNode,
          openSandbox: true,
          strictIsolation: appInstance.strictIsolation,
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

        (appInstance as any).sandbox = sandbox;

        appInstance.execScript = (code, env, url, options) => {
          sandbox.execScript(code, env, url, options);
        };
      }
    },
  };
}
