import { Sandbox } from '../sandbox';

const rawMutationObserver = window.MutationObserver;

export function observerModule(_sandbox: Sandbox) {
  const observers: MutationObserver[] = [];

  class MutationObserver extends rawMutationObserver {
    constructor(cb: MutationCallback) {
      super(cb);
      observers.push(this);
    }
  }

  const recover = () => {
    observers.forEach((observer) => {
      observer.disconnect();
    });
    observers.splice(0);
  };

  return {
    recover,
    override: {
      MutationObserver: MutationObserver as Function,
    },
  };
}
