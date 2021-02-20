import Sandbox from '@garfish/sandbox';
import { deepMerge, error } from '@garfish/utils';

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

export interface OverridesData {
  recover?: () => void;
  override?: Record<string, any>;
  created?: (context: Sandbox['context']) => void;
}

export interface Provider {
  destroy: ({ dom: HTMLElement }) => void;
  render: ({ dom: HTMLElement, basename: string }) => void;
}

export interface SandboxConfig {
  open?: boolean;
  snapshot?: boolean;
  useStrict?: boolean;
  strictIsolation?: boolean;
  hooks?: Sandbox['options']['hooks'];
  modules?: Record<string, (sandbox: Sandbox) => OverridesData>;
}
export interface Config {
  basename?: string;
  apps: Array<AppInfo>;
  sandbox?: SandboxConfig;
  autoRefreshApp?: boolean;
  props?: Record<string, any>;
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

const defaultOptions: Options = {
  apps: [],
  basename: '',
  sandbox: {
    open: true,
    hooks: {},
    modules: {},
    snapshot: false,
    useStrict: true,
    strictIsolation: false,
  },
  protectVariable: [],
  insulationVariable: [],
  autoRefreshApp: true,
  disablePreloadApp: false,
  domGetter: () => null,
  beforeLoad: () => {},
  afterLoad: () => {},
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

export const getDefaultOptions = () => deepMerge({}, defaultOptions);
