// ref: https://github.com/jaenster/weakref-pollyfill/blob/master/src/index.js
(function (global) {
  if (
    typeof global === 'object' &&
    global &&
    typeof global['WeakRef'] === 'undefined'
  ) {
    global.WeakRef = (function (wm) {
      function WeakRef(this: any, target) {
        wm.set(this, target);
      }

      WeakRef.prototype.deref = function () {
        return wm.get(this);
      };

      return WeakRef;
    })(new WeakMap());
  }
})(
  (function () {
    switch (true) {
      case typeof globalThis === 'object' && !!globalThis:
        return globalThis;
      case typeof self === 'object' && !!self:
        return self;
      case typeof window === 'object' && !!window:
        return window;
      case typeof Function === 'function':
        return Function('return this')();
    }
    return null;
  })(),
);

declare global {
  type IWeakKey = object;

  // ref: https://github.com/microsoft/TypeScript/blob/main/src/lib/es2021.weakref.d.ts
  interface WeakRef<T extends IWeakKey> {
    readonly [Symbol.toStringTag]: 'WeakRef';

    /**
     * Returns the WeakRef instance's target value, or undefined if the target value has been
     * reclaimed.
     * In es2023 the value can be either a symbol or an object, in previous versions only object is permissible.
     */
    deref(): T | undefined;
  }

  interface WeakRefConstructor {
    readonly prototype: WeakRef<any>;

    /**
     * Creates a WeakRef instance for the given target value.
     * In es2023 the value can be either a symbol or an object, in previous versions only object is permissible.
     * @param target The target value for the WeakRef instance.
     */
    new <T extends IWeakKey>(target: T): WeakRef<T>;
  }

  export let WeakRef: WeakRefConstructor;
}

export {};
