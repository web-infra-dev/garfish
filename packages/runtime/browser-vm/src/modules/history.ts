import { hasOwn, rawObject, rawWindow } from '@garfish/utils';

export function historyOverride() {
  const proto =
    rawObject.getPrototypeOf(rawWindow.history) || History.prototype;
  const fakeHistory = rawObject.create(proto);

  const proxyHistory = new Proxy(fakeHistory, {
    get(target: any, p: PropertyKey) {
      const value = hasOwn(target, p) ? target[p] : rawWindow.history[p];
      return typeof value === 'function'
        ? value.bind(rawWindow.history)
        : value;
    },

    // "__proto__" is not a standard attribute, it is temporarily not compatible
    getPrototypeOf() {
      return fakeHistory;
    },
  });

  const fakeHistoryCtor = function History() {
    throw new TypeError('Illegal constructor');
  };
  // Avoid side effects of prototype chain being changed
  fakeHistoryCtor.prototype = fakeHistory;
  fakeHistoryCtor.prototype.constructor = fakeHistoryCtor;

  return {
    override: {
      history: proxyHistory,
      History: fakeHistoryCtor,
    },
  };
}
