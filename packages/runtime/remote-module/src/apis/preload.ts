import { assert, isAbsolute } from '@garfish/utils';
import { processAlias } from './setModuleInfo';
import { loader, resourcesStore } from '../common';

// Preload the static resources of the module, so that the module can be loaded synchronously
export function preload(urls: string | Array<string>) {
  if (!Array.isArray(urls)) urls = [urls];

  return Promise.all(
    urls.map((url) => {
      url = processAlias(url)[0];
      assert(
        isAbsolute(url),
        `The loading of the remote module must be an absolute path. "${url}"`,
      );
      return loader.loadModule(url).then((data) => {
        resourcesStore.push(data.resourceManager);
      });
    }),
  );
}
