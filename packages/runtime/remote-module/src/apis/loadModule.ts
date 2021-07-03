import { assert, isPromise, isAbsolute } from '@garfish/utils';
import { Actuator } from '../actuator';
import {
  loader,
  ModuleInfo,
  cacheModules,
  fetchLoading,
  purifyOptions,
} from '../common';

export function loadModule(
  options: ModuleInfo | string,
): Promise<Record<string, any> | null> {
  const info = purifyOptions(options);
  const { url, env, cache, version, error, adapter } = info;

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
        result = _module;
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
        result = exports;
        cacheModules[urlWithVersion] = result;
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
