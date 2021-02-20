import { hasOwn, rawObject, rawWindow } from '@garfish/utils';

export function histroyOverride() {
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

    // __proto__ 不是一个标准的属性，暂时不做兼容
    getPrototypeOf() {
      return fakeHistory;
    },
  });

  const fakeHistoryCtor = function History() {
    throw new TypeError('Illegal constructor');
  };
  // 避免原型链被更改产生副作用
  fakeHistoryCtor.prototype = fakeHistory;
  fakeHistoryCtor.prototype.constructor = fakeHistoryCtor;

  return {
    override: {
      history: proxyHistory,
      History: fakeHistoryCtor,
    },
  };
}
