import Garfish, { interfaces } from '@garfish/core';
import { assert, warn } from '@garfish/utils';
import { Sandbox } from './sandbox';

export default function BrowserVm(_Garfish: Garfish): interfaces.Plugin {
  return {
    name: 'browser-vm',
    afterLoad(appInfo, appInstance) {
      if (appInstance) {
        // existing
        if ((appInstance as any).sandbox) return;

        const sandbox = new Sandbox({
          namespace: appInfo.name,
        });
        (appInstance as any).sandbox = sandbox;

        appInstance.execScript = (code, env, url, options) => {
          sandbox.overrideContext.overrides = {
            ...sandbox.overrideContext.overrides,
            ...appInstance.getExecScriptEnv(options?.noEntry),
          };
          sandbox.execScript(code, url);
        };
      }
    },
  };
}
