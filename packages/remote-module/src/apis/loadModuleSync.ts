import { error, assert, isPromise, isAbsolute } from '@garfish/utils';
import {
  ModuleInfo,
  cacheModules,
  purifyOptions,
  getModuleCode,
  prettifyError,
} from '../common';
import { hooks } from '../hooks';
import { Actuator } from '../actuator';
import { processAlias, getValueInObject } from './setModuleConfig';

// If we want to have perfect synchronization syntax to load remote modules,
// the source code of the child application must be analyzed so that it can be loaded on demand.
// In the future, we need to wait until garfish supports esModule,
// To consider loading remote modules on demand when using synchronous syntax.
// E.g.
// 1. esModule - Static analysis, recursively build dependency tree.
// 2. webpack - Analyze the source code ast and build into different package versions.

const throwWarn = (alias: string, url: string) => {
  error(
    prettifyError(
      `The current module return a promise, You should use "loadModule('${url}')".`,
      alias,
      url,
    ),
  );
};

export function loadModuleSync(
  urlOrAlias: string,
  options?: ModuleInfo,
): Record<string, any> {
  const data = hooks.lifecycle.beforeLoadModule.emit({
    options,
    url: urlOrAlias,
  });
  urlOrAlias = data.url;
  options = data.options;

  assert(urlOrAlias, 'Missing url for loading remote module.');
  const [url, segments] = processAlias(urlOrAlias);
  assert(
    isAbsolute(url),
    `The loading of the remote module must be an absolute path. "${url}"`,
  );

  let result = null;
  const info = purifyOptions(url, options);
  const { cache, version, externals, error, adapter } = info;
  const urlWithVersion = `${version || 'latest'}@${url}`;
  const module = cacheModules[urlWithVersion];
  const alias = segments ? segments[0] : '';

  if (cache && module) {
    isPromise(module) && throwWarn(alias, url);
    result = getValueInObject(module, segments);
  } else {
    const manager = getModuleCode(url);
    assert(
      manager,
      `Synchronously load module must load resources in advance. "${url}"`,
    );

    try {
      const actuator = new Actuator(manager, externals);
      cacheModules[urlWithVersion] = actuator.env.exports;
      let exports = actuator.execScript().exports;

      if (typeof adapter === 'function') {
        exports = adapter(exports);
      }
      exports = hooks.lifecycle.afterLoadModule.emit({ url, exports }).exports;
      isPromise(exports) && throwWarn(alias, url);
      cacheModules[urlWithVersion] = exports;
      result = getValueInObject(exports, segments);
    } catch (e) {
      delete cacheModules[urlWithVersion];
      if (typeof error === 'function') {
        result = error(e, info, alias);
      } else {
        throw prettifyError(e, alias, url);
      }
    }
  }
  return result;
}
