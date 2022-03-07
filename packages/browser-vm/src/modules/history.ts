import { hasOwn, makeMap } from '@garfish/utils';
import { verifySetter } from '../proxyInterceptor/shared';

// Can't set to proxy history variable
const passedKey = makeMap(['scrollRestoration']);

export function historyModule() {
  const proto = Object.getPrototypeOf(window.history) || History.prototype;
  const fakeHistory = Object.create(proto);

  const proxyHistory = new Proxy(fakeHistory, {
    get(target: any, p: PropertyKey) {
      const value = hasOwn(target, p) ? target[p] : window.history[p];
      return typeof value === 'function' ? value.bind(window.history) : value;
    },

    set(target: any, p: PropertyKey, value: any, receiver: any) {
      const isPassKey = typeof p === 'string' && passedKey(p);
      const verifySetterResult = verifySetter(
        isPassKey ? history : null,
        target,
        p,
        value,
        receiver,
      );
      if (verifySetterResult !== undefined) {
        return verifySetterResult;
      } else {
        return isPassKey
          ? Reflect.set(history, p, value)
          : Reflect.set(target, p, value, receiver);
      }
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
