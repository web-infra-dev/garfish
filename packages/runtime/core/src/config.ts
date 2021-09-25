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

export const generateAppOptions = async (
  appName: string,
  garfish: interfaces.Garfish,
  appOptions: Partial<interfaces.AppInfo> | string = {},
) => {
  let appInfo = garfish.appInfos[appName];
  // `Garfish.loadApp('appName', 'https://xx.html');`
  if (typeof appOptions === 'string') {
    appOptions = {
      name: appName,
      basename: '/',
      entry: appOptions,
    } as interfaces.AppInfo;
  }

  appInfo = appInfo
    ? deepMergeConfig(appInfo, appOptions)
    : deepMergeConfig(garfish.options, appOptions);
  // Does not support does not have remote resources application
  assert(
    appInfo.entry,
    `Can't load unexpected child app "${appName}", ` +
      'Please provide the entry parameters or registered in advance of the app.',
  );
  appInfo.name = appName;
  // Initialize the mount point, support domGetter as promise, is advantageous for the compatibility
  if (appInfo.domGetter) {
    appInfo.domGetter = await getRenderNode(appInfo.domGetter);
  }
  return appInfo as AppInfo;
};

// Each main application needs to generate a new configuration
export const createDefaultOptions = (nested = false) => {
  const config: interfaces.Options = {
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
    beforeLoad: () => {},
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
    errorLoadApp: (e) => error(e),
    errorMountApp: (e) => error(e),
    errorUnmountApp: (e) => error(e),
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
