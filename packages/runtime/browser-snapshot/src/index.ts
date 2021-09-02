import { SnapshotSandbox } from './sandbox';
import { interfaces } from '@garfish/core';
import './globalExtensions';

export interface SandboxConfig {
  snapshot?: boolean;
  disableWith?: boolean;
  strictIsolation?: boolean;
}

interface BrowserConfig {
  open?: boolean;
  protectVariable?: PropertyKey[];
}

export default function BrowserSnapshot(op?: BrowserConfig) {
  return function (Garfish: interfaces.Garfish): interfaces.Plugin {
    const config: BrowserConfig = op || { open: true };

    const options = {
      name: 'browser-snapshot',
      version: __VERSION__,
      openBrowser: false,
      afterLoad(appInfo, appInstance) {
        const sandboxConfig = appInfo.sandbox || Garfish?.options?.sandbox;
        if (sandboxConfig === false || sandboxConfig.open === false)
          config.open = false;
        if (sandboxConfig) {
          config.open = sandboxConfig?.open && sandboxConfig?.snapshot === true;
          config.protectVariable = [
            ...(Garfish?.options.protectVariable || []),
            ...(appInfo.protectVariable || []),
          ];
        }
        options.openBrowser = config.open;
        if (!config.open) return;
        if (appInstance) {
          // existing
          if (appInstance.snapshotSandbox) return;
          const sandbox = new SnapshotSandbox(
            appInfo.name,
            config.protectVariable,
          );
          appInstance.snapshotSandbox = sandbox;
        }
      },
      beforeMount(appInfo, appInstance) {
        // existing
        if (!appInstance.snapshotSandbox) return;
        appInstance.snapshotSandbox.activate();
      },
      afterUnmount(appInfo, appInstance) {
        if (!appInstance.snapshotSandbox) return;
        appInstance.snapshotSandbox.deactivate();
      },
    };
    return options;
  };
}

export { SnapshotSandbox } from './sandbox';
