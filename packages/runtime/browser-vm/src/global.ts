import { Sandbox } from './sandbox';

declare module '@garfish/core' {
  export namespace interfaces {
    export interface App {
      vmSandbox?: Sandbox;
    }
  }
}

export let currentRunningSandbox: Sandbox | null = null;

const sandboxMap = new Map();

export const setSandbox = function (id: string, sandbox: Sandbox) {
  if (sandboxMap.get(id)) return;
  sandboxMap.set(id, sandbox);
};

export const getSandbox = function (id: string) {
  return sandboxMap.get(id);
};

export const getCurrentRunningSandbox = function () {
  return currentRunningSandbox;
};

export const setCurrentRunningSandbox = function (sandbox) {
  currentRunningSandbox = sandbox;
};
