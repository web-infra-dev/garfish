import { Sandbox } from '../sandbox';

const rawMutationObserver = window.MutationObserver;

export function observerModule(_sandbox: Sandbox) {
  const observerSet = new Set<MutationObserver>();

  class MutationObserver extends rawMutationObserver {
    constructor(cb: MutationCallback) {
      super(cb);
      observerSet.add(this);
    }
  }

  const recover = () => {
    observerSet.forEach((observer) => {
      if (typeof observer.disconnect === 'function') observer.disconnect();
    });
    observerSet.clear();
  };

  return {
    recover,
    override: {
      MutationObserver: MutationObserver as Function,
    },
  };
}
