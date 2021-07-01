import { assert, isAbsolute } from '@garfish/utils';
import { Actuator } from '../actuator';
import {
  purifyOptions,
  ComponentInfo,
  cacheComponents,
  getComponentCode,
} from '../common';

// If we want to have perfect synchronization syntax to load remote components,
// the source code of the child application must be analyzed so that it can be loaded on demand.
// In the future, we need to wait until garfish supports esmodule,
// To consider loading remote components on demand when using synchronous syntax.
// E.g.
// 1. esModule - Static analysis, recursively build dependency tree.
// 2. webpack - Analyze the source code ast and build into different package versions.

export function loadComponentSync(
  options: ComponentInfo | string,
): Record<string, any> {
  const info = purifyOptions(options);
  assert(info.url, 'Missing url for loading micro component');
  assert(
    isAbsolute(info.url),
    'The loading of the micro component must be an absolute path.',
  );

  let result = null;
  const { url, env, cache, version, error, adapter } = info;
  const urlWithVersion = `${version || 'latest'}@${url}`;
  const component = cacheComponents[urlWithVersion];

  if (cache && component) {
    result = component;
  } else {
    const manager = getComponentCode(url);
    assert(
      manager,
      'Synchronously load components must load resources in advance.',
    );

    try {
      const actuator = new Actuator(manager, env);
      let exports = actuator.execScript().exports;
      if (typeof adapter === 'function') {
        exports = adapter(exports);
      }
      result = exports;
      cacheComponents[urlWithVersion] = result;
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
