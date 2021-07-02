import {
  assert,
  isPromise,
  isAbsolute,
  error as GarfishError,
} from '@garfish/utils';
import { Actuator } from '../actuator';
import {
  purifyOptions,
  ComponentInfo,
  cacheComponents,
  getComponentCode,
} from '../common';

// If we want to have perfect synchronization syntax to load remote components,
// the source code of the child application must be analyzed so that it can be loaded on demand.
// In the future, we need to wait until garfish supports esModule,
// To consider loading remote components on demand when using synchronous syntax.
// E.g.
// 1. esModule - Static analysis, recursively build dependency tree.
// 2. webpack - Analyze the source code ast and build into different package versions.

export function loadComponentSync(
  options: ComponentInfo | string,
): Record<string, any> {
  const info = purifyOptions(options);
  const { url, env, cache, version, error, adapter } = info;

  assert(url, 'Missing url for loading remote components');
  assert(
    isAbsolute(url),
    `The loading of the remote component must be an absolute path. "${url}"`,
  );

  let result = null;
  const urlWithVersion = `${version || 'latest'}@${url}`;
  const component = cacheComponents[urlWithVersion];

  if (cache && component) {
    result = component;
  } else {
    const manager = getComponentCode(url);
    assert(
      manager,
      `Synchronously load components must load resources in advance. "${url}"`,
    );

    try {
      const actuator = new Actuator(manager, env);
      let exports = actuator.execScript().exports;
      if (typeof adapter === 'function') {
        exports = adapter(exports);
      }
      result = exports;
      if (isPromise(result)) {
        GarfishError(
          `The current component return a promise, you should switch to asynchronous loading. "${url}"`,
        );
      }
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
