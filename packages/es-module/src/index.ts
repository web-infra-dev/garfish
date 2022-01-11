import { transformUrl } from '@garfish/utils';
import { runtime } from './runtime';

export async function startByUrl(entry: string) {
  if (!entry) throw new Error('Missing entry');
  const requestUrl = transformUrl(location.href, entry);
  await runtime.compileAndFetchCode(requestUrl, requestUrl);
  return () => runtime.importMemoryModule(requestUrl);
}
