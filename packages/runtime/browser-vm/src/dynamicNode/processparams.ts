// @ts-nocheck
import { handlerParams } from '../utils';

export function injectHandlerParams() {
  // iframe modify read
  if (window.MutationObserver) {
    const rawObserver = window.MutationObserver.prototype.observe;
    MutationObserver.prototype.observe = function () {
      return rawObserver.apply(this, handlerParams(arguments));
    };
  }
  console.log('in iframe not modify activeElement');
  // in iframe not modify activeElement
  const rawActiveEl = Object.getOwnPropertyDescriptor(
    window.Document.prototype,
    'activeElement',
  ).get;
  Object.defineProperty(window.Document.prototype, 'activeElement', {
    get(...args) {
      return rawActiveEl.apply(handlerParams([this])[0], handlerParams(args));
    },
  });
}
