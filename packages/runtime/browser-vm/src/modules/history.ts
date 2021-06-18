import { hasOwn } from '@garfish/utils';

export function historyOverride() {
  const proto = Object.getPrototypeOf(window.history) || History.prototype;
  const fakeHistory = Object.create(proto);

  const proxyHistory = new Proxy(fakeHistory, {
    get(target: any, p: PropertyKey) {
      const value = hasOwn(target, p) ? target[p] : window.history[p];
      return typeof value === 'function' ? value.bind(window.history) : value;
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
