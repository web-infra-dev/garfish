import { isObject, isPromise } from '@garfish/utils';

type ESModuleResult<T> = {
  default: T;
  __esModule: true;
};

export function esModule<T extends Promise<any>>(
  obj: T,
): Promise<ESModuleResult<T extends Promise<infer P> ? P : T>>;
export function esModule<T extends ESModuleResult<any>>(obj: T): T;
export function esModule<T>(obj: T): ESModuleResult<T>;
export function esModule(obj: any) {
  if (isObject(obj) && obj.__esModule === true) {
    return obj;
  } else if (isPromise(obj)) {
    return obj.then(esModule);
  } else {
    const esm = { default: obj };
    Object.defineProperty(esm, '__esModule', { value: true });
    return esm;
  }
}
