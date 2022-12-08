import { Sandbox } from '../sandbox';

export function observerModule(_sandbox: Sandbox) {
  const observerSet = new Set<MutationObserver>();

  class ProxyMutationObserver extends MutationObserver {
    observe(target: Node, options?: MutationObserverInit | undefined): void {
      observerSet.add(this);
      return super.observe(target, options);
    }

    disconnect(): void {
      observerSet.delete(this);
      return super.disconnect();
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
      MutationObserver: ProxyMutationObserver as Function,
    },
  };
}
