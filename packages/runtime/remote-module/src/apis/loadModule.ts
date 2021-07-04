import { assert, isPromise, isAbsolute } from '@garfish/utils';
import {
  loader,
  ModuleInfo,
  cacheModules,
  fetchLoading,
  purifyOptions,
} from '../common';
import { Actuator } from '../actuator';
import { processAlias, getValueInObject } from './setModuleAlias';

export function loadModule(
  options: ModuleInfo | string,
): Promise<Record<string, any> | null> {
  const info = purifyOptions(options);
  const { env, cache, version, url: originalUrl, error, adapter } = info;
  const [url, segments] = processAlias(originalUrl);

  assert(url, 'Missing url for loading remote module');
  assert(
    isAbsolute(url),
    `The loading of the remote module must be an absolute path. "${url}"`,
  );

  // `1.0@https://xx.js`
  // `latest@https://xx.js`
  const urlWithVersion = `${version || 'latest'}@${url}`;

  const asyncLoadProcess = async () => {
    let result = null;
    try {
      const _module = cacheModules[urlWithVersion];
      if (cache && _module) {
        result = getValueInObject(_module, segments);
      } else {
        const data = await loader.loadModule(url);
        const actuator = new Actuator(data.resourceManager, env);
        let exports = actuator.execScript().exports;

        if (isPromise(exports)) {
          exports = await exports;
        }
        if (typeof adapter === 'function') {
          exports = adapter(exports);
        }
        result = getValueInObject(exports, segments);
        cacheModules[urlWithVersion] = exports;
      }
    } catch (err) {
      if (typeof error === 'function') {
        result = error(err);
      } else {
        throw err;
      }
    } finally {
      fetchLoading[urlWithVersion] = null;
    }
    return result;
  };
  if (!fetchLoading[urlWithVersion]) {
    fetchLoading[urlWithVersion] = asyncLoadProcess();
  }
  return fetchLoading[urlWithVersion];
}
