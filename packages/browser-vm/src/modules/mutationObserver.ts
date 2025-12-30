import { Sandbox } from '../sandbox';

export function observerModule(_sandbox: Sandbox) {
  const observerSet = new Set<MutationObserver>();

  class ProxyMutationObserver extends MutationObserver {
    constructor(cb: MutationCallback) {
      super(cb);
      if (!_sandbox.options.disableCollect) {
        observerSet.add(this);
      }
    }

    disconnect() {
      if (observerSet.has(this)) {
        observerSet.delete(this);
      }
      super.disconnect();
    }
  }

  const recover = () => {
    observerSet.forEach((observer) => {
      if (observer && typeof observer.disconnect === 'function') {
        observer.disconnect();
      }
    });
    observerSet.clear();
  };

  return {
    recover,
    override: {
      MutationObserver: ProxyMutationObserver as Function,
    },
  };
}
