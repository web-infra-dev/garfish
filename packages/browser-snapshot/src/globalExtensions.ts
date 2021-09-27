import { Sandbox } from './sandbox';

declare module '@garfish/core' {
  export namespace interfaces {
    export interface Config {
      protectVariable?: PropertyKey[];
      insulationVariable?: PropertyKey[];
      sandbox?: SandboxConfig | false;
    }

    export interface App {
      snapshotSandbox?: Sandbox;
    }

    export interface Plugin {
      openBrowser?: boolean;
    }
  }
}
