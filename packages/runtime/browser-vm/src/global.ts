import { Sandbox } from './sandbox';

declare module '@garfish/core' {
  export namespace interfaces {
    export interface App {
      vmSandbox?: Sandbox;
    }
  }
}

export let currentRunningSandbox: Sandbox | null = null;

const sandboxMap = new WeakMap();

export const setElementSandbox = function (element: Element, sandbox: Sandbox) {
  if (sandboxMap.get(element)) return;
  sandboxMap.set(element, sandbox);
};

export const getElementSandbox = function (element: Element): Sandbox {
  return sandboxMap.get(element);
};

export const getCurrentRunningSandbox = function () {
  return currentRunningSandbox;
};

export const setCurrentRunningSandbox = function (sandbox) {
  currentRunningSandbox = sandbox;
};
