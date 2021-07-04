import { isObject, isPromise } from '@garfish/utils';

type EsModuleResult<T> = {
  default: T;
  __esModule: true;
};

export function esModule<T>(obj: T) {
  if (isObject(obj) && (obj as any).__esModule === true) {
    return obj;
  } else if (isPromise(obj)) {
    return (obj as any).then(esModule) as Promise<EsModuleResult<T>>;
  } else {
    const esm = { default: obj };
    Object.defineProperty(esm, '__esModule', { value: true });
    return esm;
  }
}
