export type Module = Record<PropertyKey, any>;

export type NamespaceModule = Module & {
  [Symbol.toStringTag]: 'Module';
};

export interface importObject {
  meta: {
    url: string;
    __garfish: boolean;
  };
}

function Module() {}
export function createNamespaceModule(module: Module) {
  const moduleObject: NamespaceModule = new Module();
  Object.setPrototypeOf(moduleObject, null);
  Object.defineProperty(moduleObject, Symbol.toStringTag, {
    value: 'Module',
    writable: false,
    enumerable: false,
    configurable: false,
  });
  Object.keys(module).forEach((key) => {
    const getter = Object.getOwnPropertyDescriptor(module, key).get;
    Object.defineProperty(moduleObject, key, {
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
  Object.seal(moduleObject);
  return moduleObject;
}

export function createImportMeta(url: string) {
  const metaObject: importObject = Object.create(null);
  const set = (key, value) => {
    Object.defineProperty(metaObject, key, {
      value,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  };
  set('url', url);
  set('__garfish', true);
  return { meta: metaObject };
}
