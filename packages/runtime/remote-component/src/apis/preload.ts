import { assert, isAbsolute } from '@garfish/utils';
import { loader, storedResources } from '../common';

// Preload the static resources of the component, so that the component can be loaded synchronously
export function preload(urls: string | Array<string>) {
  if (!Array.isArray(urls)) urls = [urls];

  return Promise.all(
    urls.map((url) => {
      assert(
        isAbsolute(url || ''),
        `The loading of the remote component must be an absolute path. "${url}"`,
      );
      return loader.loadComponent(url).then((data) => {
        storedResources.push(data.resourceManager);
      });
    }),
  );
}
