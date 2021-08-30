import { EventEmitter } from 'events';
import { SyncHook, AsyncHook } from '@garfish/hooks';
import {
  Loader,
  StyleManager,
  ModuleManager,
  TemplateManager,
  JavaScriptManager,
} from '@garfish/loader';
import { App, AppInterface } from '../module/app';
import { appLifecycle, globalLifecycle } from '../hooks/lifecycle';

export namespace interfaces {
  export type DomGetter =
    | Element
    | string
    | (() => Element | null)
    | (() => Promise<Element>);

  export interface LoaderResult {
    mount: () => void;
    unmount: () => void;
  }

  export interface App extends AppInterface {}

  export interface StyleManagerInterface extends StyleManager {}
  export interface ModuleManagerInterface extends ModuleManager {}
  export interface TemplateManagerInterface extends TemplateManager {}
  export interface JavaScriptManagerInterface extends JavaScriptManager {}

  export interface Garfish {
    flag: symbol;
    version: string;
    running: boolean;
    externals: Record<string, any>;
    loader: Loader;
    options: Options;
    channel: EventEmitter;
    activeApps: Array<interfaces.App>;
    hooks: ReturnType<typeof globalLifecycle>;
    cacheApps: Record<string, interfaces.App>;
    appInfos: Record<string, interfaces.AppInfo>;
    loadApp(
      name: string,
      opts: Partial<interfaces.AppInfo> | string,
    ): Promise<interfaces.App | null>;
  }

  export interface AppRenderInfo {
    isMount?: boolean;
    isUnmount?: boolean;
  }

  export interface Provider {
    destroy: ({ dom: HTMLElement, appRenderInfo: AppRenderInfo }) => void;
    render: ({
      dom: HTMLElement,
      basename: string,
      appRenderInfo: AppRenderInfo,
    }) => void;
  }

  export interface SandboxConfig {
    open?: boolean;
    snapshot?: boolean;
    disableWith?: boolean;
    strictIsolation?: boolean;
  }

  export interface Config {
    appID?: string;
    basename?: string;
    apps?: Array<AppInfo>;
    sandbox?: SandboxConfig | false;
    plugins?: Array<(context: Garfish) => Plugin>;
    props?: Record<string, any>;
    disableStatistics?: boolean;
    disablePreloadApp?: boolean;
    // onNotMatchRouter?: (path: string) => Promise<void> | void;
    // autoRefreshApp?: boolean;
    domGetter?: DomGetter;
    nested?: boolean;
  }

  export declare type MountLifeCycleFn = (
    appInfo: AppInfo,
    app: interfaces.App,
  ) => Promise<void> | void;

  export declare type LoadLifeCycleFn<T> = (appInfo: AppInfo) => T;

  export declare type EvalLifeCycleFn = (
    appInfo: AppInfo,
    code: string,
    env: Record<string, any>,
    url: string,
    options: { async?: boolean; noEntry?: boolean },
  ) => void;

  export interface GlobalLifecycle {
    beforeLoad?: LoadLifeCycleFn<Promise<void | boolean> | void | boolean>;
    afterLoad?: MountLifeCycleFn;
    beforeMount?: MountLifeCycleFn;
    afterMount?: MountLifeCycleFn;
    beforeUnmount?: MountLifeCycleFn;
    afterUnmount?: MountLifeCycleFn;
    beforeEval?: EvalLifeCycleFn;
    afterEval?: EvalLifeCycleFn;
    errorLoadApp?: (err: Error | string, appInfo: AppInfo) => void;
    errorMountApp?: (err: Error | string, appInfo: AppInfo) => void;
    errorUnmountApp?: (err: Error | string, appInfo: AppInfo) => void;
    errorExecCode?: (err: Error | string, appInfo: AppInfo) => void;
    /** @deprecated */
    customLoader?: (
      provider: Provider,
      appInfo: AppInfo,
      path: string,
    ) => Promise<LoaderResult | void> | LoaderResult | void;
  }

  export type Options = Config & GlobalLifecycle;

  export type AppLifecycle = Pick<
    GlobalLifecycle,
    keyof ReturnType<typeof appLifecycle>['lifecycle']
  >;
  export type AppConfig = Pick<
    Config,
    'domGetter' | 'sandbox' | 'props' | 'basename' | 'protectVariable'
  > & {
    name: string;
    entry: string;
    cache?: boolean;
    nested?: boolean;
  };

  type _AppInfo = AppLifecycle & AppConfig;
  export interface AppInfo extends _AppInfo {}

  export interface ResourceModules {
    js: Array<JavaScriptManager>;
    link: Array<StyleManagerInterface>;
    modules: Array<ModuleManager>;
  }

  export type BootStrapArgs = [Garfish, Options];

  type AppConstructor = InstanceType<typeof App>;

  export interface Lifecycle {
    // beforeInitialize: SyncHook<Options, void>;
    // initialize: SyncHook<Options, void>;
    // beforeBootstrap: SyncHook<Options, void>;
    // bootstrap: SyncHook<Options, void>;
    // beforeRegisterApp: SyncHook<[AppInfo | Array<AppInfo>], void>;
    // registerApp: SyncHook<[Record<string, interfaces.AppInfo>], void>;
    // beforeLoad: AsyncSeriesBailHook<AppInfo, boolean | void | AppConstructor>; // 根据返回值决定是否继续执行后续代码 or return a constructor
    // initializeApp: AsyncSeriesBailHook<
    //   [
    //     Garfish,
    //     AppInfo,
    //     TemplateManagerInterface,
    //     interfaces.ResourceModules,
    //     boolean,
    //   ],
    //   App
    // >;
    // afterLoad: SyncHook<[AppInfo, App | void], void | boolean>;
    // processResource: SyncHook<
    //   [AppInfo, TemplateManagerInterface, interfaces.ResourceModules],
    //   void | boolean
    // >;
    // beforeEval: SyncHook<
    //   [
    //     AppInfo,
    //     string,
    //     Record<string, any>,
    //     string,
    //     { async?: boolean; noEntry?: boolean },
    //   ],
    //   void
    // >;
    // afterEval: SyncHook<
    //   [
    //     AppInfo,
    //     string,
    //     Record<string, any>,
    //     string,
    //     { async?: boolean; noEntry?: boolean },
    //   ],
    //   void
    // >;
    // beforeMount: SyncHook<[AppInfo, interfaces.App], void>;
    // afterMount: SyncHook<[AppInfo, interfaces.App], void>;
    // beforeUnMount: SyncHook<[AppInfo, interfaces.App], void>;
    // afterUnMount: SyncHook<[AppInfo, interfaces.App], void>;
    // errorLoadApp: SyncHook<[Error, AppInfo], void>;
    // errorMountApp: SyncHook<[Error, AppInfo], void>;
    // errorUnmountApp: SyncHook<[Error, AppInfo], void>;
    // errorExecCode: SyncHook<[Error, AppInfo], void>;
    nitialize: any;
    beforeBootstrap: any;
    bootstrap: any;
    beforeRegisterApp: any;
    registerApp: any;
    beforeLoad: any; // 根据返回值决定是否继续执行后续代码 or return a constructor
    initializeApp: any;
    afterLoad: any;
    processResource: any;
    beforeEval: any;
    afterEval: any;
    beforeMount: any;
    afterMount: any;
    beforeUnmount: any;
    afterUnmount: any;
    errorLoadApp: any;
    errorMountApp: any;
    errorUnmountApp: any;
    errorExecCode: any;
  }

  // type ConstructorParameters<T> = T extends SyncHook<any, any>
  //   ? T extends {
  //       tap: (options: any, fn: (...args: infer P) => infer R) => any;
  //     }
  //     ? (...args: P) => R
  //     : never
  //   : T extends {
  //       tapPromise: (options: any, fn: (...args: infer A) => infer AR) => any;
  //     }
  //   ? (...args: A) => AR
  //   : never;

  // type PickParam<T> = {
  //   [k in keyof T]: ConstructorParameters<T[k]>;
  // };

  type PickParam<T> = {
    [k in keyof T]: any;
  };
  export interface Plugin extends PickParam<Partial<interfaces.Lifecycle>> {
    name: string;
    version?: string;
  }
}
