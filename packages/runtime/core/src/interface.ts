import { EventEmitter } from 'events';
import { SyncHook, AsyncHook } from '@garfish/hooks';
import {
  Loader,
  StyleManager,
  ModuleManager,
  TemplateManager,
  JavaScriptManager,
} from '@garfish/loader';
import { AppInterface } from './module/app';
import { appLifecycle, globalLifecycle } from './hooks/lifecycle';

export namespace interfaces {
  export interface StyleManagerInterface extends StyleManager {}
  export interface ModuleManagerInterface extends ModuleManager {}
  export interface TemplateManagerInterface extends TemplateManager {}
  export interface JavaScriptManagerInterface extends JavaScriptManager {}

  export interface ResourceModules {
    js: Array<JavaScriptManager>;
    modules: Array<ModuleManager>;
    link: Array<StyleManagerInterface>;
  }

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

  export interface Config {
    appID?: string;
    nested?: boolean;
    basename?: string;
    apps?: Array<AppInfo>;
    domGetter?: DomGetter;
    props?: Record<string, any>;
    disableStatistics?: boolean;
    disablePreloadApp?: boolean;
    plugins?: Array<(context: Garfish) => Plugin>;
    sandbox?:
      | false
      | {
          open?: boolean;
          snapshot?: boolean;
          disableWith?: boolean;
          strictIsolation?: boolean;
        };
  }

  export interface GlobalLifecycle extends Partial<PluginLifecycle> {
    /** @deprecated */
    customLoader?: (
      provider: Provider,
      appInfo: AppInfo,
      path: string,
    ) => Promise<LoaderResult | void> | LoaderResult | void;
  }

  export type AppLifecycle = Pick<
    GlobalLifecycle,
    keyof ReturnType<typeof appLifecycle>['lifecycle']
  >;

  export type AppConfig = Pick<
    Config,
    | 'domGetter'
    | 'sandbox'
    | 'props'
    | 'basename'
    | 'protectVariable'
    | 'insulationVariable'
  > & {
    name: string;
    entry: string;
    cache?: boolean;
    nested?: boolean;
  };

  export interface Options extends Config, GlobalLifecycle {}
  export interface AppInfo extends AppConfig, AppLifecycle {}

  type PluginLifecycle = {
    [k in keyof Lifecycle]: Parameters<Lifecycle[k]['on']>[0];
  };

  export interface Plugin extends Partial<PluginLifecycle> {
    name: string;
    version?: string;
  }

  export type Lifecycle = ReturnType<typeof appLifecycle>['lifecycle'] &
    ReturnType<typeof globalLifecycle>['lifecycle'];
}
