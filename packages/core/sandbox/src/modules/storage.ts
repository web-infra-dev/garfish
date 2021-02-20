import { Sandbox } from '../context';
import { GAR_NAMESPACE_PREFIX } from '../symbolTypes';

// 自定义的Storage类
export class CusStorage {
  prefix: string;
  namespace: string;
  rawStorage: Storage;

  constructor(namespace: string, rawStorage: Storage) {
    this.rawStorage = rawStorage;
    this.namespace = namespace;
    this.prefix = `${GAR_NAMESPACE_PREFIX}${namespace}__`;
  }

  // 劫持length
  get length() {
    return this.getKeys().length;
  }

  private getKeys() {
    return Object.keys(this.rawStorage).filter((key) =>
      key.startsWith(this.prefix),
    );
  }

  // 获取当前命名空间的第 n 个 key, 需要去除前缀
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
