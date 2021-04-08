export interface AppInfo {
  name: string;
  entry: string;
  cache?: boolean;
  props?: Record<string, any>;
  activeWhen?: string | ((path: string) => boolean); // 手动加载，可不填写路由
  active?: (appInfo: AppInfo, rootPath: string) => void;
  deactive?: (appInfo: AppInfo, rootPath: string) => void;
}

interface LoaderResult {
  mount: () => void;
  unmount: () => void;
}

export declare type LifeCycleFn = (
  appInfo: AppInfo,
  path: string,
) => Promise<void> | void;

export interface Provider {
  destroy: ({ dom: HTMLElement }) => void;
  render: ({ dom: HTMLElement, basename: string }) => void;
}

export interface SandboxConfig {
  open?: boolean;
  snapshot?: boolean;
  useStrict?: boolean;
  strictIsolation?: boolean;
}

export interface Config {
  appID?: string;
  basename?: string;
  apps: Array<AppInfo>;
  sandbox?: SandboxConfig;
  autoRefreshApp?: boolean;
  props?: Record<string, any>;
  disableStatistics?: boolean;
  disablePreloadApp?: boolean;
  protectVariable?: Array<PropertyKey>;
  insulationVariable?: Array<PropertyKey>;
  domGetter: (() => Element | null | Promise<Element | null>) | string;
}

export interface Hooks {
  beforeEval?: LifeCycleFn;
  afterEval?: LifeCycleFn;
  beforeMount?: LifeCycleFn;
  afterMount?: LifeCycleFn;
  beforeUnmount?: LifeCycleFn;
  afterUnmount?: LifeCycleFn;
  beforeLoad?: (
    appInfo: AppInfo,
    opts: LoadAppOptions,
  ) => Promise<void | false> | void | false;
  afterLoad?: (appInfo: AppInfo, opts: LoadAppOptions) => Promise<void> | void;
  onNotMatchRouter?: (path: string) => Promise<void> | void;
  errorLoadApp?: (err: Error | string, appInfo: AppInfo) => void;
  errorMountApp?: (err: Error | string, appInfo: AppInfo) => void;
  errorUnmountApp?: (err: Error | string, appInfo: AppInfo) => void;
  customLoader?: (
    provider: Provider,
    appInfo: AppInfo,
    path: string,
  ) => Promise<LoaderResult | void> | LoaderResult | void;
}

export type Options = Config & Hooks;

export type LoadAppOptions = Partial<Options> & {
  data?: any;
  cache?: boolean; // 是否缓存
};
