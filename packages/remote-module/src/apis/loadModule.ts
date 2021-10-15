import { assert, isPromise, isAbsolute } from '@garfish/utils';
import {
  loader,
  ModuleInfo,
  cacheModules,
  fetchLoading,
  purifyOptions,
  prettifyError,
} from '../common';
import { Actuator } from '../actuator';
import { processAlias, getValueInObject } from './setModuleConfig';

export function loadModule(
  urlOrAlias: string,
  options?: ModuleInfo,
): Promise<Record<string, any> | null> {
  assert(urlOrAlias, 'Missing url for loading remote module.');
  const [url, segments] = processAlias(urlOrAlias);
  assert(
    isAbsolute(url),
    `The loading of the remote module must be an absolute path. "${url}"`,
  );

  const info = purifyOptions(url, options);
  const { cache, version, externals, error, adapter } = info;
  const urlWithVersion = `${version || 'latest'}@${url}`; // `latest@https://xx.js`

  const asyncLoadProcess = async () => {
    let result = null;
    let module = cacheModules[urlWithVersion];

    if (cache && module) {
      if (isPromise(module)) {
        module = await module;
      }
      result = getValueInObject(module, segments);
    } else {
      try {
        const data = await loader.loadModule(url);

        const actuator = new Actuator(data.resourceManager, externals);
        cacheModules[urlWithVersion] = actuator.env.exports;
        let exports = actuator.execScript().exports;

        if (typeof adapter === 'function') {
          exports = adapter(exports);
        }
        cacheModules[urlWithVersion] = exports;
        if (isPromise(exports)) {
          exports = await exports;
        }
        result = getValueInObject(exports, segments);
      } catch (e) {
        delete cacheModules[urlWithVersion];
        const alias = segments ? segments[0] : '';
        if (typeof error === 'function') {
          result = error(e, info, alias);
        } else {
          throw prettifyError(e, alias, url);
        }
      } finally {
        fetchLoading[urlWithVersion] = null;
      }
    }
    return result;
  };

  if (fetchLoading[urlWithVersion]) {
    return fetchLoading[urlWithVersion].then(() => {
      return Promise.resolve(cacheModules[urlWithVersion]).then((m) =>
        getValueInObject(m, segments),
      );
    });
  }
  fetchLoading[urlWithVersion] = asyncLoadProcess();
  return fetchLoading[urlWithVersion];
}
