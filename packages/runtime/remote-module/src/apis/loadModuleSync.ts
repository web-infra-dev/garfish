import { error, assert, isPromise, isAbsolute } from '@garfish/utils';
import {
  ModuleInfo,
  cacheModules,
  purifyOptions,
  getModuleCode,
  prettifyError,
} from '../common';
import { Actuator } from '../actuator';
import { processAlias, getValueInObject } from './setModuleConfig';

// If we want to have perfect synchronization syntax to load remote modules,
// the source code of the child application must be analyzed so that it can be loaded on demand.
// In the future, we need to wait until garfish supports esModule,
// To consider loading remote modules on demand when using synchronous syntax.
// E.g.
// 1. esModule - Static analysis, recursively build dependency tree.
// 2. webpack - Analyze the source code ast and build into different package versions.

const throwWarn = (url: string) => {
  error(
    `The current module return a promise, You should use "loadModule('${url}')".`,
  );
};

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
  const module = cacheModules[urlWithVersion];

  if (cache && module) {
    isPromise(module) && throwWarn(url);
    result = getValueInObject(module, segments);
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
      isPromise(exports) && throwWarn(url);
      cacheModules[urlWithVersion] = exports;
      result = getValueInObject(exports, segments);
    } catch (err) {
      const alias = segments ? segments[0] : '';
      if (typeof error === 'function') {
        result = error(err, info, alias);
      } else {
        throw prettifyError(err, alias, url);
      }
    }
  }
  return result;
}
