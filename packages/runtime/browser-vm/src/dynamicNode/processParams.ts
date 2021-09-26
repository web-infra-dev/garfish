import { handlerParams } from '../utils';

export function injectHandlerParams() {
  if (window.MutationObserver) {
    const rawObserver = window.MutationObserver.prototype.observe;
    MutationObserver.prototype.observe = function () {
      return rawObserver.apply(this, handlerParams(arguments));
    };
  }

  // in iframe not modify activeElement
  const desc = Object.getOwnPropertyDescriptor(
    window.Document.prototype,
    'activeElement',
  );
  const rawActiveEl = desc && desc.get;
  if (rawActiveEl) {
    Object.defineProperty(window.Document.prototype, 'activeElement', {
      get(...args) {
        return rawActiveEl.apply(handlerParams([this])[0], handlerParams(args));
      },
    });
  }
}
