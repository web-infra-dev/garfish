import { error, isObject, deepMerge, makeMapObject } from '@garfish/utils';
import { AppInfo } from './module/app';
import { interfaces } from './interface';
import { appLifecycle, globalLifecycle } from './lifecycle';

const appConfigKeys = [
  'name',
  'entry',
  'activeWhen',
  'basename',
  'domGetter',
  'props',
  'sandbox',
  'cache',
  'noCheckProvider',
  'protectVariable',
  'insulationVariable',
  'customLoader',
  'nested',
  'active',
  'deactive',
  'rootPath',
  ...appLifecycle().lifecycleKeys,
] as const;

type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

const appConfigKeysMap: {
  [k in keyof Required<interfaces.AppInfo>]: boolean;
} = makeMapObject<Mutable<typeof appConfigKeys>>(
  appConfigKeys as Mutable<typeof appConfigKeys>,
);

// `props` may be responsive data
export const deepMergeConfig = <T extends Partial<AppInfo>>(
  globalConfig: T,
  localConfig: T,
) => {
  const globalProps = globalConfig.props;
  const localProps = localConfig.props;

  if (globalProps || localProps) {
    globalConfig = { ...globalConfig };
    localConfig = { ...localConfig };
    delete globalConfig.props;
    delete localConfig.props;
  }

  const result = deepMerge(globalConfig, localConfig);
  if (globalProps) result.props = { ...globalProps };
  if (localProps) result.props = { ...(result.props || {}), ...localProps };
  return result;
};

export const getAppConfig = <T extends Partial<AppInfo>>(
  globalConfig: T,
  localConfig: T,
): T => {
  const mergeConfig = deepMergeConfig(globalConfig, localConfig);

  Object.keys(mergeConfig).forEach((key) => {
    if (!appConfigKeysMap[key] || typeof mergeConfig[key] === 'undefined') {
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
