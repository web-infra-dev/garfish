import { error, isObject, deepMerge, filterUndefinedVal } from '@garfish/utils';
import { AppInfo } from './module/app';
import { interfaces } from './interface';

// filter unless global config
const appConfigKeys: Array<keyof interfaces.Config> = [
  'appID',
  'apps',
  'disableStatistics',
  'disablePreloadApp',
  'plugins',
];

// `props` may be responsive data
export const deepMergeConfig = <T extends Partial<AppInfo>>(
  globalConfig: T,
  localConfig: T,
) => {
  const props = {
    ...(globalConfig.props || {}),
    ...(localConfig.props || {}),
  };

  const result = deepMerge(
    filterUndefinedVal(globalConfig),
    filterUndefinedVal(localConfig),
  );
  result.props = props;
  return result;
};

export const getAppConfig = <T extends Partial<AppInfo>>(
  globalConfig: T,
  localConfig: T,
): T => {
  const mergeConfig = deepMergeConfig(globalConfig, localConfig);

  Object.keys(mergeConfig).forEach((key: keyof interfaces.Config) => {
    if (appConfigKeys.includes(key)) {
      delete mergeConfig[key];
    }
  });

  return mergeConfig;
};

export const generateAppOptions = (
  appName: string,
  garfish: interfaces.Garfish,
  options?: Omit<AppInfo, 'name'>,
): AppInfo => {
  let appInfo = garfish.appInfos[appName] || { name: appName };

  // Merge register appInfo config and loadApp config
  if (isObject(options)) {
    appInfo = getAppConfig(appInfo, {
      ...options,
      name: appName,
    });
  }

  // Merge globalConfig with localConfig
  appInfo = getAppConfig(garfish.options, appInfo);

  return appInfo as AppInfo;
};

// Each main application needs to generate a new configuration
export const createDefaultOptions = () => {
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
      fixBaseUrl: false,
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
    customLoader: undefined, // deprecated
  };

  return config;
};
