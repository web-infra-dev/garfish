import {
  error,
  isPrimitive,
  isPlainObject,
  parseContentType,
} from '@garfish/utils';
import { Manager, Loader, LoadedPluginArgs } from './index';

export async function request(url: string, config: RequestInit) {
  const result = await fetch(url, config || {});
  // Response codes greater than "400" are regarded as errors
  if (result.status >= 400) {
    error(`"${url}" load failed with status "${result.status}"`);
  }
  const code = await result.text();
  const type = result.headers.get('content-type');
  const mimeType = parseContentType(type);
  return { code, result, mimeType };
}

export function copyResult(result: LoadedPluginArgs<any>['value']) {
  if (result.resourceManager) {
    result.resourceManager = (result.resourceManager as Manager).clone();
  }
  return result;
}

// Compatible with old api
export function mergeConfig(loader: Loader, url: string) {
  const extra = loader.requestConfig;
  const config = typeof extra === 'function' ? extra(url) : extra;
  return { mode: 'cors', ...config } as RequestInit;
}

export function calculateObjectSize(obj: any) {
  let size = 0;
  const valueSet = new WeakSet();
  const add = (val: any) => {
    if (isPrimitive(val)) {
      size += new Blob([val]).size;
    } else if (isPlainObject(val)) {
      if (!valueSet.has(val)) {
        valueSet.add(val);
        for (const key in val) add(val[key]);
      }
    } else if (Array.isArray(val)) {
      if (!valueSet.has(val)) {
        valueSet.add(val);
        val.forEach(add);
      }
    } else {
      size += new Blob([val]).size;
    }
  };
  add(obj);
  return size;
}
