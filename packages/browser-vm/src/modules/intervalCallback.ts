import { Sandbox } from '../sandbox';

interface CollectionTarget {
  id: number;
  callback: (() => void) | null;
};

export function intervalCallbackModule (_sandbox: Sandbox) {
  const requestAnimationFrameSet = new Set<CollectionTarget>();
  const requestIdelCallbackSet = new Set<CollectionTarget>();

  const proxyRequestAnimationFrame = (callback) => {
    const id = window?.requestAnimationFrame(callback);
    if(id) {
      requestAnimationFrameSet.add({
        id,
        callback,
      });
    }
  };

  const proxyRequestIdleCallback = (callback) => {
    const id = window?.requestIdleCallback(callback);
    if(id) {
      requestIdelCallbackSet.add({
        id,
        callback,
      })
    }
  }

  return {
    override: {
      requestAnimationFrame: proxyRequestAnimationFrame,
      requestIdleCallback: proxyRequestIdleCallback,
    },

    recover() {
      requestAnimationFrameSet.forEach(target => {
        window?.cancelAnimationFrame(target.id);
        target.callback = null;
      });

      requestIdelCallbackSet.forEach(target => {
        window?.cancelIdleCallback(target.id);
        target.callback = null;
      });
    },
  };
};
