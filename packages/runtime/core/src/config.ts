import { deepMerge, error, hasOwn, warn } from '@garfish/utils';
import { interfaces } from './interface';

// Because of the addition of nested scenes, the configuration merging is too complicated
export const lifecycle: Array<Exclude<
  keyof interfaces.HooksLifecycle,
  'customLoader'
>> = [
  'beforeLoad',
  'afterLoad',
  'beforeEval',
  'afterEval',
  'beforeMount',
  'afterMount',
  'beforeUnmount',
  'afterUnmount',
  'errorLoadApp',
  'errorMountApp',
  'errorUnmountApp',
];

const globalConfigAttrs = [
  'apps',
  'plugins',
  'autoRefreshApp',
  'onNotMatchRouter',
  'disableStatistics',
  'disablePreloadApp',
];

const invalidNestedAttrs = [
  'sandbox',
  'autoRefreshApp',
  'disableStatistics',
  'disablePreloadApp',
];

export const filterNestedConfig = (config: interfaces.Options) => {
  if (config.nested) {
    invalidNestedAttrs.forEach((key) => {
      if (key in config) {
        delete config[key];
        __DEV__ &&
          warn(`Nested scene does not support the configuration ${key}`);
      }
    });
  }
  return config;
};

export const filterGlobalConfig = (config: interfaces.AppInfo) => {
  for (const key in config) {
    if (globalConfigAttrs.includes(key)) {
      delete config[key];
    }
  }
  return config;
};

// Merge `oldConfig` and `newConfig`
export const deepMergeConfig = (o, n) => {
  let tempO = o;
  let tempN = n;
  const oHasProps = o && hasOwn(o, 'props');
  const nHasProps = n && hasOwn(n, 'props');

  if (oHasProps) {
    tempO = Object.assign({}, o);
    delete tempO.props;
  }
  if (nHasProps) {
    tempN = Object.assign({}, n);
    delete tempN.props;
  }
  const result = deepMerge(tempO, tempN);
  if (oHasProps || nHasProps) {
    result.props = n.props || o.props;
  }
  return result;
};

// Each main application needs to generate a new configuration
export const createDefaultOptions = (nested = false) => {
  const config: interfaces.Options = {
    nested,
    apps: [],
    props: {},
    basename: '/',
    customLoader: null, // deprecated
    autoRefreshApp: true,
    disableStatistics: false,
    disablePreloadApp: false,
    sandbox: {
      snapshot: false,
      disableWith: false,
      strictIsolation: false,
    },
    // Load hooks
    beforeLoad: async () => {},
    afterLoad: () => {},
    // Code eval hooks
    beforeEval: () => {},
    afterEval: () => {},
    // App mount hooks
    beforeMount: () => {},
    afterMount: () => {},
    beforeUnmount: () => {},
    afterUnmount: () => {},
    // Error hooks
    errorLoadApp: (err) => error(err),
    errorMountApp: (err) => error(err),
    errorUnmountApp: (err) => error(err),
    // Router
    onNotMatchRouter: () => {},
    // Use an empty div by default
    domGetter: () => document.createElement('div'),
  };

  if (nested) {
    invalidNestedAttrs.forEach((key) => delete config[key]);
  }
  return config;
};
