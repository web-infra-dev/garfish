import { VText, VNode } from '@garfish/utils';
import {
  CssResource,
  HtmlResource as HtmlResourceInterfaces,
  JsResource as JsResourceInterfaces,
} from '../module/source';
import {
  SyncHook,
  AsyncSeriesBailHook,
  AsyncParallelBailHook,
  AsyncSeriesHook,
} from '@garfish/hooks';
import { Garfish } from '../garfish';
import { Loader } from '../module/loader';
import { EventEmitter } from 'events';
// import { App } from '../module/app';

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

  export interface App {}
  export interface Component {}

  export interface AppInfo
    extends Exclude<
      Options,
      ['apps', 'appID', 'plugins', 'disableStatistics', 'plugins']
    > {
    name: string;
    entry: string;
    cache?: boolean; // Whether the cache
    activeWhen?: string | ((path: string) => boolean);
    hooks?: Hooks;
  }

  export type ComponentParser = (
    code: string,
    env: Record<string, any>,
    url?: string,
  ) => Promise<void | boolean> | void | boolean;

  export interface ComponentInfo {
    name: string;
    url: string;
    cache?: boolean; // Whether the cache
    props?: Record<string, any>;
    version?: string;
    parser?: ComponentParser;
  }

  // export interface SandboxConfig {
  //   open?: boolean;
  //   snapshot?: boolean;
  //   useStrict?: boolean;
  //   strictIsolation?: boolean;
  // }

  export interface Garfish {
    flag: symbol;
    cacheApps: Record<string, interfaces.App>;
    running: boolean;
    version: string;
    options: Options;
    appInfos: Record<string, interfaces.AppInfo>;
    activeApps: Record<string, interfaces.App>;
    plugins: Array<interfaces.Plugin>;
    channel: EventEmitter;
    loader: Loader;
    hooks: Hooks;
    loadApp(
      name: string,
      opts: interfaces.LoadAppOptions,
    ): Promise<interfaces.App>;
    loadComponent(
      name: string,
      opts: interfaces.LoadComponentOptions,
    ): Promise<interfaces.Component>;
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
  }

  export interface Config {
    appID?: string;
    basename?: string;
    apps?: Array<AppInfo>;
    sandbox?: SandboxConfig;
    plugins?: Array<(context: Garfish) => Plugin>;
    props?: Record<string, any>;
    disableStatistics?: boolean;
    disablePreloadApp?: boolean;
    domGetter?: DomGetter;
    nested?: boolean;
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
    errorLoadApp?: (err: Error | string, appInfo: AppInfo) => void;
    errorMountApp?: (err: Error | string, appInfo: AppInfo) => void;
    errorUnmountApp?: (err: Error | string, appInfo: AppInfo) => void;
    customLoader?: (
      provider: Provider,
      appInfo: AppInfo,
      path: string,
    ) => Promise<LoaderResult | void> | LoaderResult | void;
  }

  export type HtmlResource = HtmlResourceInterfaces;
  export type JsResource = JsResourceInterfaces;

  export type Options = Config & HooksLifecycle;

  export type LoadAppOptions = Pick<AppInfo, Exclude<keyof AppInfo, 'name'>> & {
    entry?: string;
    domGetter: DomGetter;
  };

  export type LoadComponentOptions = Pick<
    ComponentInfo,
    Exclude<keyof ComponentInfo, 'name'>
  >;

  type AsyncResource = {
    async: boolean;
    content: () => Promise<any>;
  };

  export interface ResourceModules {
    link: Array<any>;
    js: Array<any | AsyncResource>;
  }

  export interface AppSources {
    manager: HtmlResource;
    resources: ResourceModules;
    isHtmlMode: boolean;
  }

  // export interface Loader {
  //   forceCaches: Set<string>;
  //   caches: Record<string, HtmlResource | CssResource | JsResource>;
  //   loadings: Record<
  //     string,
  //     Promise<HtmlResource | CssResource | JsResource>
  //   >;
  //   requestConfig: RequestInit | ((url: string) => RequestInit);
  //   takeJsResources(manager: HtmlResource): any[]
  //   loadAppSources(appInfo: AppInfo): Promise<AppSources>;
  //   // takeLinkResources(manager: HtmlResource): any[]
  //   // createApp(appInfo: AppInfo, manager: HtmlResource, isHtmlMode: boolean): Promise<any>
  //   // loadAllSources(manager: HtmlResource, isHtmlMode: boolean): Promise<{
  //   //   manager: HtmlResource;
  //   //   resources: interfaces.ResourceModules;
  //   //   isHtmlMode: boolean;
  //   // }>
  //   // load(url: string, config?: RequestInit): Promise<HtmlResource | CssResource | JsResource>
  //   // loadAppSources(appInfo: interfaces.AppInfo): Promise<interfaces.AppSources>
  // }

  export type BootStrapArgs = [Garfish, Options];

  type AppConstructor = new (
    context: Garfish,
    appInfo: AppInfo,
    entryResManager: HtmlResource,
    resources: interfaces.ResourceModules,
    isHtmlMode: boolean,
  ) => any;

  export interface App {
    name: string;
    appInfo: AppInfo;
    entryResManager: interfaces.HtmlResource;
    cjsModules: Record<string, any>;
    customExports: Record<string, any>; // If you don't want to use the CJS export, can use this
    mounted: boolean;
    appContainer: HTMLElement;
    provider: Provider;
    global: any;
    htmlNode: HTMLElement | ShadowRoot;
    isHtmlMode: boolean;
    strictIsolation: boolean;
    sourceList: Array<string>;
    mount(): Promise<boolean>;
    unmount(): boolean;
    getExecScriptEnv(noEntry: boolean): Record<string, any>;
    execScript(
      code: string,
      env: Record<string, any>,
      url?: string,
      options?: {
        async?: boolean;
        noEntry?: boolean;
      },
    ): void;
  }

  export interface Component {
    name: string;
    componentInfo: ComponentInfo;
    cjsModules: Record<string, any>;
    global: any;
    getExecScriptEnv(noEntry: boolean): Record<string, any>;
    execScript(
      code: string,
      env: Record<string, any>,
      url?: string,
      options?: {
        async?: boolean;
        noEntry?: boolean;
      },
    ): void;
    getComponent: () => any;
  }

  export interface Lifecycle {
    // beforeInitialize: SyncHook<Options, void>;
    initialize: SyncHook<Options, void>;
    beforeBootstrap: SyncHook<Options, void>;
    bootstrap: SyncHook<Options, void>;
    beforeRegisterApp: SyncHook<[AppInfo | Array<AppInfo>], void>;
    registerApp: SyncHook<[Record<string, interfaces.AppInfo>], void>;
    beforeLoad: AsyncSeriesBailHook<AppInfo, boolean | void | AppConstructor>; // 根据返回值决定是否继续执行后续代码 or return a constructor
    initializeApp: AsyncSeriesBailHook<
      [Garfish, AppInfo, HtmlResource, interfaces.ResourceModules, boolean],
      App
    >;
    afterLoad: SyncHook<[AppInfo, App | void], void | boolean>;
    processResource: SyncHook<
      [AppInfo, HtmlResource, interfaces.ResourceModules],
      void | boolean
    >;
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
    beforeMount: SyncHook<[AppInfo, interfaces.App], void>;
    afterMount: SyncHook<[AppInfo, interfaces.App], void>;
    errorMount: SyncHook<[AppInfo, Error], void>;
    beforeUnMount: SyncHook<[AppInfo, interfaces.App], void>;
    afterUnMount: SyncHook<[AppInfo, interfaces.App], void>;
    errorExecCode: SyncHook<[AppInfo, Error], void>;
  }

  type ConstructorParameters<T> = T extends SyncHook<any, any>
    ? T extends {
        tap: (options: any, fn: (...args: infer P) => infer R) => any;
      }
      ? (...args: P) => R
      : never
    : T extends {
        tapPromise: (options: any, fn: (...args: infer A) => infer AR) => any;
      }
    ? (...args: A) => AR
    : never;

  type PickParam<T> = {
    [k in keyof T]: ConstructorParameters<T[k]>;
  };

  export interface Plugin extends PickParam<Partial<interfaces.Lifecycle>> {
    name: string;
    version?: string;
  }

  export interface Hooks {
    lifecycle: Lifecycle;
    usePlugins(plugin: Plugin): void;
  }
}
