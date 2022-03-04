
export type MemoryModule = Record<string, any>;

export type MetaObject = { url: string; __garfishPolyfill__: boolean };

export type Module = {
  [key: string]: any;
  [Symbol.toStringTag]: 'Module';
};

function Module() {}

export function createModule(memoryModule: MemoryModule) {
  const module: Module = new Module();
  Object.setPrototypeOf(module, null);
  Object.defineProperty(module, Symbol.toStringTag, {
    value: 'Module',
    writable: false,
    enumerable: false,
    configurable: false,
  });

  Object.keys(memoryModule).forEach((key) => {
    const getter = Object.getOwnPropertyDescriptor(memoryModule, key).get;
    Object.defineProperty(module, key, {
      enumerable: true,
      configurable: false,
      get: getter,
      set: () => {
        throw TypeError(
          `Cannot assign to read only property '${key}' of object '[object Module]`,
        );
      },
    });
  });

  Object.seal(module);
  return module;
}

export function createImportMeta(url: string) {
  const metaObject: MetaObject = Object.create(null);
  const set = (key, value) => {
    Object.defineProperty(metaObject, key, {
      value,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  };

  set('url', url);
  set('__garfishPolyfill__', true);
  return { meta: metaObject };
}
