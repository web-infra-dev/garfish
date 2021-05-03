import { VText, VNode } from '@garfish/utils';
import { HtmlResource } from '../module/source';
import {
  SyncHook,
  AsyncSeriesBailHook,
  AsyncParallelBailHook,
  AsyncSeriesHook,
} from '@garfish/hooks';
import { Garfish } from '../instance/context';
import { App } from '../module/app';

export namespace interfaces {
  export type DomGetter = Element | (() => Element | null) | string;

  export interface LoaderResult {
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

  export interface Provider {
    destroy: ({ dom: HTMLElement }) => void;
    render: ({ dom: HTMLElement, basename: string }) => void;
  }

  export interface Config {
    appID?: string;
    basename?: string;
    apps?: Array<AppInfo>;
    sandbox?: SandboxConfig;
    plugins?: Array<(context: Garfish) => Plugin>;
    autoRefreshApp?: boolean;
    props?: Record<string, any>;
    disableStatistics?: boolean;
    disablePreloadApp?: boolean;
    protectVariable?: Array<PropertyKey>;
    insulationVariable?: Array<PropertyKey>;
    domGetter?: DomGetter;
  }

  export interface HooksLifecycle {
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
    afterLoad?: (
      appInfo: AppInfo,
      opts: LoadAppOptions,
    ) => Promise<void> | void;
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

  export type LoadAppOptions = Pick<AppInfo, keyof AppInfo> & {
    entry?: string;
    domGetter: DomGetter;
  };

  type AsyncResource = {
    async: boolean;
    content: () => Promise<any>;
  };

  export interface ResourceModules {
    link: Array<any>;
    js: Array<any | AsyncResource>;
  }

  export interface AppInfo {
    name: string;
    entry: string;
    basename?: string;
    cache?: boolean; // Whether the cache
    props?: Record<string, any>;
    domGetter?: DomGetter;
    activeWhen?: string | ((path: string) => boolean); // 手动加载，可不填写路由
    active?: (appInfo: AppInfo, rootPath: string) => void;
    deactive?: (appInfo: AppInfo, rootPath: string) => void;
  }

  export interface AppSources {
    manager: HtmlResource;
    resources: ResourceModules;
    isHtmlMode: boolean;
  }

  export interface Loader {
    loadAppSources(appInfo: AppInfo): Promise<AppSources>;
    // takeJsResources: (manager: HtmlResource) => void;
    // takeLinkResources: (manager: HtmlResource) => void;
    // createApp(appInfo: AppInfo, manager: HtmlResource, isHtmlMode: boolean): Promise<any>
  }

  export type BootStrapArgs = [Garfish, Options];

  export interface Lifecycle {
    beforeInitialize: SyncHook<Options, void>;
    initialize: SyncHook<Options, void>;
    beforeBootstrap: SyncHook<Options, void>;
    bootstrap: SyncHook<Options, void>;
    beforeRegisterApp: SyncHook<[AppInfo | Array<AppInfo>], void>;
    registerApp: SyncHook<[AppInfo | Array<AppInfo>], void>;
    beforeLoad: AsyncSeriesBailHook<AppInfo, void | boolean>; // 根据返回值决定是否继续执行后续代码
    afterLoad: SyncHook<[AppInfo, App], void | boolean>;
    errorLoadApp: SyncHook<[AppInfo, Error], void>;
    beforeEval: SyncHook<
      [
        AppInfo,
        string,
        Record<string, any>,
        string,
        { async?: boolean; noEntry?: boolean },
      ],
      void
    >;
    afterEval: SyncHook<
      [
        AppInfo,
        string,
        Record<string, any>,
        string,
        { async?: boolean; noEntry?: boolean },
      ],
      void
    >;
    beforeMount: SyncHook<[AppInfo], void>;
    afterMount: SyncHook<[AppInfo], void>;
    errorMount: SyncHook<[AppInfo, Error], void>;
    beforeUnMount: SyncHook<[AppInfo], void>;
    afterUnMount: SyncHook<[AppInfo], void>;
    errorExecCode: SyncHook<[AppInfo, Error], void>;
  }

  export interface Hooks {
    lifecycle: Lifecycle;
    usePlugins(plugin: Plugin): void;
  }
}
