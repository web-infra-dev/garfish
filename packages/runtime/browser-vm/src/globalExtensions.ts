import { Module } from './types';
import { Sandbox } from './sandbox';

// export declare module
declare module '@garfish/core' {
  // This type declaration is used to extend garfish core
  export interface Garfish {
    getGlobalObject: () => Window & typeof globalThis;
    setGlobalValue(key: string, value?: any): void;
    clearEscapeEffect: (key: string, value?: any) => void;
  }

  export namespace interfaces {
    export interface Garfish {
      setGlobalValue(key: string, value?: any): void;
      getGlobalObject: () => Window & typeof globalThis;
      clearEscapeEffect: (key: string, value?: any) => void;
    }

    export interface SandboxConfig {
      modules?: Array<Module>;
    }

    export interface Config {
      protectVariable?: PropertyKey[];
      insulationVariable?: PropertyKey[];
      sandbox?: SandboxConfig;
    }

    export interface App {
      vmSandbox?: Sandbox;
    }

    export interface Plugin {
      openVm?: boolean;
    }
  }
}
