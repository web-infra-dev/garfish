import {
  warn,
  error,
  assert,
  hasOwn,
  deepMerge,
  getRenderNode,
  isPlainObject,
} from '@garfish/utils';
import { AppInfo } from './module/app';
import { interfaces } from './interface';

const invalidNestedAttrs = [
  'sandbox',
  'autoRefreshApp',
  'disableStatistics',
  'disablePreloadApp',
];

export const filterNestedConfig = (
  garfish: interfaces.Garfish,
  config: interfaces.Options,
  id: number,
) => {
  if (config.nested) {
    invalidNestedAttrs.forEach((key) => {
      if (key in config) {
        delete config[key];
        warn(`Nested scene does not support the configuration "${key}".`);
      }
    });
  }

  garfish.hooks.lifecycleKeys.forEach((key) => {
    const fn = config[key];
    const canCall = (info) => (info.nested = id);
    const isInfo = (info) =>
      isPlainObject(info) && hasOwn(info, 'name') && hasOwn(info, 'entry');

    if (typeof fn === 'function') {
      config[key] = function (...args) {
        const info = args.find(isInfo);
        if (!info) return fn.apply(this, args);
        if (canCall(info)) return fn.apply(this, args);
      };
    }
  });
  return config;
};

const appConfigList = [
  'name',
  'basename',
  'domGetter',
  'props',
  'sandbox',
  'cache',
  'nested',
];
const appHooksList = [
  'beforeEval',
  'afterEval',
  'beforeMount',
  'afterMount',
  'errorMountApp',
  'beforeUnmount',
  'afterUnmount',
  'errorUnmountApp',
  'errorExecCode',
];

// `props` may be responsive data
export const deepMergeConfig = <T>(o, n) => {
  const props = n.props || o.props;
  if (props) {
    o = { ...o };
    n = { ...n };
    delete o.props;
    delete n.props;
  }
  const result = deepMerge(o, n);
  if (props) result.props = props;
  return result as T;
};

export const getAppConfig = <T>(globalConfig, localConfig) => {
  // TODO: Automatically retrieve configuration in the type declaration
  const appGlobalConfig = [...appConfigList, ...appHooksList].reduce(
    (localConfig, valueKey) => {
      // Need to merge
      if (valueKey === 'props') {
        localConfig.props = {
          ...(globalConfig.props || {}),
          ...(localConfig.props || {}),
        };
      }
      // Global configuration priority is lower
      if (
        typeof localConfig[valueKey] === 'undefined' &&
        typeof globalConfig[valueKey] !== 'undefined'
      ) {
        localConfig[valueKey] = globalConfig[valueKey];
      }
      return localConfig;
    },
    localConfig,
  );
  return appGlobalConfig as T;
};

export const generateAppOptions = (
  appName: string,
  garfish: interfaces.Garfish,
  appOptionsOrUrl: Partial<interfaces.AppInfo> | string = {},
): AppInfo => {
  let appInfo = garfish.appInfos[appName];
  // Load the unregistered applications
  // `Garfish.loadApp('appName', 'https://xx.html');`
  if (!appInfo && typeof appOptionsOrUrl === 'string') {
    appInfo = {
      name: appName,
      basename: '/',
      entry: appOptionsOrUrl,
    };
  }

  // merge register appInfo config and loadApp config
  if (typeof appOptionsOrUrl === 'object') {
    appInfo = getAppConfig(appInfo, appOptionsOrUrl);
  }

  // merge globalConfig with localConfig
  appInfo = getAppConfig(garfish.options, appInfo);

  assert(
    appInfo.entry,
    `Can't load unexpected child app "${appName}", ` +
      'Please provide the entry parameters or registered in advance of the app.',
  );
  appInfo.name = appName;
  return appInfo;
};

// Each main application needs to generate a new configuration
export const createDefaultOptions = (nested = false) => {
  const config: interfaces.Options = {
    // global config
    appID: '',
    apps: [],
    autoRefreshApp: true,
    disableStatistics: false,
    disablePreloadApp: false,
    // app config
    basename: '/',
    props: {},
    // Use an empty div by default
    domGetter: () => document.createElement('div'),
    sandbox: {
      snapshot: false,
      disableWith: false,
      strictIsolation: false,
    },
    // global hooks
    beforeLoad: () => {},
    afterLoad: () => {},
    errorLoadApp: (e) => error(e),
    // Router
    onNotMatchRouter: () => {},
    // app hooks
    // Code eval hooks
    beforeEval: () => {},
    afterEval: () => {},
    // App mount hooks
    beforeMount: () => {},
    afterMount: () => {},
    beforeUnmount: () => {},
    afterUnmount: () => {},
    // Error hooks
    errorMountApp: (e) => error(e),
    errorUnmountApp: (e) => error(e),
    customLoader: null, // deprecated
  };

  if (nested) {
    invalidNestedAttrs.forEach((key) => delete config[key]);
  }
  return config;
};
