import { SnapshotSandbox } from './sandbox';
import Garfish, { interfaces } from '@garfish/core';

declare module '@garfish/core' {
  export namespace interfaces {
    export interface App {
      snapshotSandbox?: SnapshotSandbox;
    }
  }
}

export default function BrowserSnapshot(_Garfish: Garfish): interfaces.Plugin {
  return {
    name: 'browser-vm',
    afterLoad(appInfo, appInstance) {
      if (appInstance) {
        // existing
        if (appInstance.snapshotSandbox) return;
        const sandbox = new SnapshotSandbox(appInfo.name);
        appInstance.snapshotSandbox = sandbox;
      }
    },
  };
}
