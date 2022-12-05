import { interfaces } from '@garfish/core';

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
  state: Object;
  href: string;
}

export interface CurrentRouterInfo extends RouterInfo {
  matched: Array<interfaces.AppInfo>;
}

// Don't change the logo, in order to avoid inconsistent version leads to failure
export const __GARFISH_ROUTER_UPDATE_FLAG__ = '__GARFISH_ROUTER_UPDATE_FLAG__';

export const __GARFISH_ROUTER_FLAG__ = '__GARFISH_ROUTER_FLAG__';

export const __GARFISH_BEFORE_ROUTER_EVENT__ = 'garfish:before-routing-event';

export interface Options {
  basename?: string;
  listening?: boolean;
  current?: CurrentRouterInfo;
  autoRefreshApp?: boolean;
  apps: Array<interfaces.AppInfo>;
  beforeEach?: RouterHook;
  afterEach?: RouterHook;
  routerChange?: (url: string) => void;
  active: (
    appInfo: interfaces.AppInfo,
    rootPath: string | undefined,
  ) => Promise<void>;
  deactive: (
    appInfo: interfaces.AppInfo,
    rootPath: string | undefined,
  ) => Promise<void>;
  notMatch?: (path: string) => void;
}

export const RouterConfig: Options = {
  basename: '/',
  current: {
    fullPath: '/',
    path: '/',
    matched: [],
    query: {},
    state: {},
  },
  apps: [],
  beforeEach: (to, from, next) => next(),
  afterEach: (to, from, next) => next(),
  active: () => Promise.resolve(),
  deactive: () => Promise.resolve(),
  routerChange: () => {},
  autoRefreshApp: true,
  listening: true,
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
