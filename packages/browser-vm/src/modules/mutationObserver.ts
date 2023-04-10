import { Sandbox } from '../sandbox';

export function observerModule(_sandbox: Sandbox): {
  recover: () => void;
  override: Record<string, any>;
} {
  const observerSet = new Set<MutationObserver>();
  const performanceObserverSet = new Set<PerformanceObserver>();

  class ProxyMutationObserver extends MutationObserver {
    constructor(cb: MutationCallback) {
      super(cb);
      observerSet.add(this);
    }
  }
  class ProxyPerformanceObserver extends PerformanceObserver {
    constructor(cb: PerformanceObserverCallback) {
      super(cb);
      performanceObserverSet.add(this);
    }
  }

  const recover = () => {
    observerSet.forEach((observer) => {
      if (typeof observer.disconnect === 'function') observer.disconnect();
    });
    observerSet.clear();
    performanceObserverSet.forEach((observer) => {
      if (typeof observer.disconnect === 'function') observer.disconnect();
    });
  };

  return {
    recover,
    override: {
      MutationObserver: ProxyMutationObserver,
      PerformanceObserver: ProxyPerformanceObserver,
    },
  };
}
