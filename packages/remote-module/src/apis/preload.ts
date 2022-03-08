import { assert, isAbsolute } from '@garfish/utils';
import { hooks } from '../hooks';
import { processAlias } from './setModuleConfig';
import { loader, resourcesStore } from '../common';

// Preload the static resources of the module, so that the module can be loaded synchronously
export function preload(urls: string | Array<string>) {
  if (!Array.isArray(urls)) urls = [urls];
  console.log('msg');

  return Promise.all(
    urls.map((url) => {
      url = processAlias(url)[0];
      assert(
        isAbsolute(url),
        `The loading of the remote module must be an absolute path. "${url}"`,
      );
      return loader.loadModule(url).then((data) => {
        data.resourceManager.originUrl = url;
        resourcesStore.push(data.resourceManager);
        hooks.lifecycle.preloaded.emit(data.resourceManager);
        return data;
      });
    }),
  );
}
