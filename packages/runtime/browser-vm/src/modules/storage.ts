import { Sandbox } from '../sandbox';
import { GAR_NAMESPACE_PREFIX } from '../symbolTypes';

export class CusStorage {
  prefix: string;
  namespace: string;
  rawStorage: Storage;

  constructor(namespace: string, rawStorage: Storage) {
    this.rawStorage = rawStorage;
    this.namespace = namespace;
    this.prefix = `${GAR_NAMESPACE_PREFIX}${namespace}__`;
  }

  get length() {
    return this.getKeys().length;
  }

  private getKeys() {
    return Object.keys(this.rawStorage).filter((key) =>
      key.startsWith(this.prefix),
    );
  }

  // Get the "n" key of the current namespace, you need to remove the prefix
  key(n: number) {
    const key = this.getKeys()[n];
    return key ? key.substring(this.prefix.length) : null;
  }

  getItem(keyName: string) {
    return this.rawStorage.getItem(`${this.prefix + keyName}`);
  }

  setItem(keyName: string, keyValue: string) {
    this.rawStorage.setItem(`${this.prefix + keyName}`, keyValue);
  }

  removeItem(keyName: string) {
    this.rawStorage.removeItem(`${this.prefix + keyName}`);
  }

  clear() {
    this.getKeys().forEach((key) => {
      this.rawStorage.removeItem(key);
    });
  }
}

export function localStorageOverride(sandbox: Sandbox) {
  const namespace = sandbox.options.namespace;
  return {
    override: {
      localStorage: new CusStorage(namespace, localStorage),
      sessionStorage: new CusStorage(namespace, sessionStorage),
    },
  };
}
