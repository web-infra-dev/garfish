import { SnapshotSandbox } from './sandbox';

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
