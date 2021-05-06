export interface AppInfo {
  name: string;
  activeWhen: string | ((path: string) => boolean);
  entry: string;
  [prop: string]: any;
  // loader: () => Promise<any>;
}

export type RouterHook = (
  to: CurrentRouterInfo,
  from: CurrentRouterInfo,
  next,
) => void;

export type RouterChange = (path: string) => void;

export interface RouterInfo {
  fullPath: string;
  path: string;
  query: Object;
}

export interface CurrentRouterInfo extends RouterInfo {
  matched: Array<AppInfo>;
}

export const __GARFISH_ROUTER_UPDATE_FLAG__ = '__GARFISH_ROUTER_UPDATE_FLAG__';

export interface Options {
  basename?: string;
  current?: CurrentRouterInfo;
  autoRefreshApp?: boolean;
  apps: Array<AppInfo>;
  beforeEach?: RouterHook;
  afterEach?: RouterHook;
  routerChange?: (url: string) => void;
  active: (appInfo: AppInfo, rootPath: string) => Promise<void>;
  deactive: (appInfo: AppInfo, rootPath: string) => Promise<void>;
  notMatch?: (path: string) => void;
}

export const RouterConfig: Options = {
  basename: '',
  current: {
    fullPath: '/',
    path: '/',
    matched: [],
    query: {},
  },
  apps: [],
  beforeEach: (to, from, next) => next(),
  afterEach: (to, from, next) => next(),
  active: () => Promise.resolve(),
  deactive: () => Promise.resolve(),
  routerChange: () => {},
  autoRefreshApp: true,
};

export function set<T extends keyof Options>(field: T, value: Options[T]) {
  RouterConfig[field] = value;
}

export function get(field: keyof Options) {
  return RouterConfig[field];
}

export function setRouterConfig(options: Partial<Options>) {
  Object.assign(RouterConfig, options);
}
