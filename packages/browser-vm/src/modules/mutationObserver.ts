import { Sandbox } from '../sandbox';

const rawMutationObserver = MutationObserver;

export function observerModule(_sandbox: Sandbox) {
  const observers: MutationObserver[] = [];
  const fakeMutationObserverProto = Object.create(
    rawMutationObserver.prototype,
  );

  const fakeMutationObserver = function MutationObserver(cb: MutationCallback) {
    if (!(this instanceof fakeMutationObserver)) {
      throw new TypeError(
        // eslint-disable-next-line quotes
        "Failed to construct 'MutationObserver': Please use the 'new' operator.",
      );
    }

    const observerInstance = new rawMutationObserver(cb);
    Object.setPrototypeOf(observerInstance, fakeMutationObserverProto);
    observers.push(observerInstance);
    return observerInstance;
  };

  fakeMutationObserver.prototype = fakeMutationObserverProto;
  fakeMutationObserver.prototype.constructor = fakeMutationObserver;

  const recover = () => {
    observers.forEach((observer) => {
      observer.disconnect();
    });
    observers.splice(0);
  };

  return {
    recover,
    override: {
      MutationObserver: fakeMutationObserver,
    },
  };
}
