import Garfish, { interfaces } from '@garfish/core';
import { SnapshotSandbox } from './sandbox';

declare module '@garfish/core' {
  export namespace interfaces {
    export interface App {
      snapshotSandbox?: SnapshotSandbox;
    }
  }
}
