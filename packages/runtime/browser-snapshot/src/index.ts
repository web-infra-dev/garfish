import { SnapshotSandbox } from './sandbox';
import Garfish, { interfaces } from '@garfish/core';

declare module '@garfish/core' {
  export namespace interfaces {
    export interface App {
      snapshotSandbox?: SnapshotSandbox;
    }
  }
}

export default function BrowserSnapshot() {
  return function (_Garfish: Garfish): interfaces.Plugin {
    return {
      name: 'browser-snapshot',
      version: __VERSION__,
      afterLoad(appInfo, appInstance) {
        if (appInstance) {
          // existing
          if (appInstance.snapshotSandbox) return;
          const sandbox = new SnapshotSandbox(appInfo.name);
          appInstance.snapshotSandbox = sandbox;
        }
      },
      beforeMount(appInfo, appInstance) {
        // existing
        if (appInstance.snapshotSandbox) return;
        appInstance.snapshotSandbox.activate();
      },
      afterUnMount(appInfo, appInstance) {
        if (appInstance.snapshotSandbox) return;
        appInstance.snapshotSandbox.deactivate();
      },
    };
  };
}
