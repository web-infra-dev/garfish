import { SnapshotSandbox } from './sandbox';
import { Garfish, interfaces } from '@garfish/core';

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
      snapshotSandbox?: SnapshotSandbox;
    }

    export interface Plugin {
      openBrowser?: boolean;
    }
  }
}

export default function BrowserSnapshot() {
  return function (Garfish: Garfish): interfaces.Plugin {
    let openBrowser = false;
    const options = {
      name: 'browser-snapshot',
      version: __VERSION__,
      openBrowser: false,
      bootstrap() {
        if (Garfish?.options?.sandbox === false) options.openBrowser = false;
        if (Garfish?.options?.sandbox) {
          // Support for instance configuration, to ensure that old versions compatible
          const noSandbox = Garfish?.options?.sandbox?.open === false;
          const useBrowserSandbox =
            Garfish?.options?.sandbox?.snapshot === true;
          openBrowser = !noSandbox && useBrowserSandbox;
          options.openBrowser = openBrowser;
        }
      },
      afterLoad(appInfo, appInstance) {
        if (!openBrowser) return;
        if (appInstance) {
          // existing
          if (appInstance.snapshotSandbox) return;
          const sandbox = new SnapshotSandbox(appInfo.name);
          appInstance.snapshotSandbox = sandbox;
        }
      },
      beforeMount(appInfo, appInstance) {
        // existing
        if (!appInstance.snapshotSandbox) return;
        appInstance.snapshotSandbox.activate();
      },
      afterUnMount(appInfo, appInstance) {
        if (!appInstance.snapshotSandbox) return;
        appInstance.snapshotSandbox.deactivate();
      },
    };
    return options;
  };
}
