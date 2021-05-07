import { Sandbox } from './sandbox';

declare module '@garfish/core' {
  export namespace interfaces {
    export interface App {
      vmSandbox?: Sandbox;
    }
  }
}
