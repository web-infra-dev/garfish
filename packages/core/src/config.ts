import { error, isObject, deepMerge, filterUndefinedVal } from '@garfish/utils';
import { AppInfo } from './module/app';
import { interfaces } from './interface';

// filter unless global config
const filterAppConfigKeys: Record<
  Exclude<keyof interfaces.Options, keyof AppInfo>,
  true
> = {
  beforeBootstrap: true,
  bootstrap: true,
  beforeRegisterApp: true,
  registerApp: true,
  beforeLoad: true,
  afterLoad: true,
  errorLoadApp: true,
  appID: true,
  apps: true,
  disableStatistics: true,
  disablePreloadApp: true,
  plugins: true,
  autoRefreshApp: true,
  onNotMatchRouter: true,
};

// `props` may be responsive data
export const deepMergeConfig = <
  T extends { props?: Record<string, any> },
  U extends { props?: Record<string, any> },
>(
  globalConfig: T,
  localConfig: U,
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
  const mergeResult = deepMergeConfig(globalConfig, localConfig);

  Object.keys(mergeResult).forEach((key: keyof interfaces.Config) => {
    if (filterAppConfigKeys[key]) {
      delete mergeResult[key];
    }
  });

  return mergeResult;
};
export const generateAppOptions = (
  appName: string,
  garfish: interfaces.Garfish,
  options?: Omit<AppInfo, 'name'>,
): AppInfo => {
  let appInfo = garfish.appInfos[appName] || {};

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
    customLoader: null, // deprecated
  };

  return config;
};
