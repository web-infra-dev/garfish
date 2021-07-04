import {
  assert,
  isPromise,
  isAbsolute,
  error as GarfishError,
} from '@garfish/utils';
import {
  ModuleInfo,
  cacheModules,
  purifyOptions,
  getModuleCode,
} from '../common';
import { Actuator } from '../actuator';
import { processAlias, getValueInObject } from './setModuleAlias';

// If we want to have perfect synchronization syntax to load remote modules,
// the source code of the child application must be analyzed so that it can be loaded on demand.
// In the future, we need to wait until garfish supports esModule,
// To consider loading remote modules on demand when using synchronous syntax.
// E.g.
// 1. esModule - Static analysis, recursively build dependency tree.
// 2. webpack - Analyze the source code ast and build into different package versions.

export function loadModuleSync(
  options: ModuleInfo | string,
): Record<string, any> {
  const info = purifyOptions(options);
  const { env, cache, version, url: originalUrl, error, adapter } = info;
  const [url, segments] = processAlias(originalUrl);

  assert(url, 'Missing url for loading remote module');
  assert(
    isAbsolute(url),
    `The loading of the remote module must be an absolute path. "${url}"`,
  );

  let result = null;
  const urlWithVersion = `${version || 'latest'}@${url}`;
  const _module = cacheModules[urlWithVersion];

  if (cache && _module) {
    result = getValueInObject(_module, segments);
  } else {
    const manager = getModuleCode(url);
    assert(
      manager,
      `Synchronously load module must load resources in advance. "${url}"`,
    );

    try {
      const actuator = new Actuator(manager, env);
      let exports = actuator.execScript().exports;
      if (typeof adapter === 'function') {
        exports = adapter(exports);
      }
      if (isPromise(exports)) {
        GarfishError(
          `The current module return a promise, you should switch to asynchronous loading. "${url}"`,
        );
      }
      result = getValueInObject(exports, segments);
      cacheModules[urlWithVersion] = exports;
    } catch (err) {
      if (typeof error === 'function') {
        result = error(err);
      } else {
        throw err;
      }
    }
  }
  return result;
}
