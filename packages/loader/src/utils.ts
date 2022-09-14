import { error, parseContentType } from '@garfish/utils';
import { Manager, Loader } from './index';

export async function request(url: string, config: RequestInit) {
  const result = await fetch(url, config || {});
  // Response codes greater than "400" are regarded as errors
  if (result.status >= 400) {
    error(`"${url}" load failed with status "${result.status}"`);
  }
  const code = await result.text();
  const type = result.headers.get('content-type');
  const size = Number(result.headers.get('content-size'));
  const mimeType = parseContentType(type);

  return {
    code,
    type,
    result,
    mimeType,
    size: Number.isNaN(size) ? null : size,
  };
}

export function copyResult(result) {
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
