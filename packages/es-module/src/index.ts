import { transformUrl } from '@garfish/utils';
import { runtime } from './runtime';

export function startByUrl(entry: string) {
  if (!entry) throw new Error('Missing entry');
  return () => runtime.asyncImport(transformUrl(location.href, entry));
}
