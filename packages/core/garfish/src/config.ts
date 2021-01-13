import SandBox from '@garfish/sandbox';
import { error } from '@garfish/utils';

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
) => Promise<any> | void;

export interface OverridesData {
  recover?: () => void;
  override?: Record<string, any>;
  created?: (context: SandBox['context']) => void;
}

export interface Provider {
  destroy: ({ dom: HTMLElement }) => void;
  render: ({ dom: HTMLElement, basename: string }) => void;
}

export interface SandboxConfig {
  open: boolean;
  snapshot: boolean;
  useStrict: boolean;
  proxyBody: boolean;
  modules?: Record<string, (sandbox: SandBox) => OverridesData>;
}

export interface Options {
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
  beforeEval?: LifeCycleFn;
  afterEval?: LifeCycleFn;
  beforeMount?: LifeCycleFn;
  afterMount?: LifeCycleFn;
  beforeUnmount?: LifeCycleFn;
  afterUnmount?: LifeCycleFn;
  errorLoadApp?: (err: Error, appInfo: AppInfo) => void;
  errorMountApp?: (err: Error, appInfo: AppInfo) => void;
  errorUnmountApp?: (err: Error, appInfo: AppInfo) => void;
  beforeLoad?: (appInfo: AppInfo) => Promise<any> | void;
  onNotMatchRouter?: (path: string) => Promise<any> | void;
  customLoader?: (
    provider: Provider,
    appInfo: AppInfo,
    path: string,
  ) => Promise<LoaderResult | any> | void;
}

export type LoadAppOptions = Partial<Options> & {
  data?: any;
  cache?: boolean; // 是否缓存
};

export const DefaultOptions: Options = {
  apps: [],
  basename: '',
  sandbox: {
    open: true,
    modules: {},
    snapshot: false,
    useStrict: true,
    proxyBody: false,
  },
  protectVariable: [],
  insulationVariable: [],
  autoRefreshApp: true,
  disableStatistics: false,
  disablePreloadApp: false,
  domGetter: () => null,
  beforeLoad: () => {},
  beforeEval: () => {},
  afterEval: () => {},
  beforeMount: () => {},
  afterMount: () => {},
  beforeUnmount: () => {},
  afterUnmount: () => {},
  errorLoadApp: (err) => error(err),
  errorMountApp: (err) => error(err),
  errorUnmountApp: (err) => error(err),
  onNotMatchRouter: () => {},
};
