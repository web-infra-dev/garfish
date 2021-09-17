import { PluginSystem } from '@garfish/hooks';
import * as LoaderInterface from '@garfish/loader';
import { Garfish as GarfishInterface } from './garfish';
import { CustomerLoader, App as AppInterface } from './module/app';
import { appLifecycle, globalLifecycle } from './lifecycle';

export namespace interfaces {
  export interface StyleManager extends LoaderInterface.StyleManager {}
  export interface ModuleManager extends LoaderInterface.ModuleManager {}
  export interface TemplateManager extends LoaderInterface.TemplateManager {}
  export interface JavaScriptManager
    extends LoaderInterface.JavaScriptManager {}

  export interface ResourceModules {
    link: Array<StyleManager>;
    js: Array<JavaScriptManager>;
    modules: Array<ModuleManager>;
  }

  export interface App extends AppInterface {}
  export interface Garfish extends GarfishInterface {}

  export type AppHooks = ReturnType<typeof appLifecycle>;
  export type GlobalHooks = ReturnType<typeof globalLifecycle>;

  export type Lifecycle = AppHooks['lifecycle'] & GlobalHooks['lifecycle'];
  export type PluginLifecycle = {
    [k in keyof Lifecycle]: Parameters<Lifecycle[k]['on']>[0];
  };

  export type DomGetter =
    | Element
    | string
    | (() => Element | null)
    | (() => Promise<Element>);

  export interface LoaderResult {
    mount: () => void;
    unmount: () => void;
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
    nested?: boolean;
    basename?: string;
    apps?: Array<AppInfo>;
    domGetter?: DomGetter;
    props?: Record<string, any>;
    disableStatistics?: boolean;
    disablePreloadApp?: boolean;
    plugins?: Array<(context: Garfish) => Plugin>;
    sandbox?: false | SandboxConfig;
  }

  export interface GlobalLifecycle extends Partial<PluginLifecycle> {
    /** @deprecated */
    customLoader?: CustomerLoader;
  }

  export type AppLifecycle = Pick<
    GlobalLifecycle,
    keyof AppHooks['lifecycle']
  > & {
    /** @deprecated */
    customLoader?: CustomerLoader;
  };

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
    entry?: string;
    cache?: boolean;
    nested?: number;
    noCheckProvider?: boolean;
  };

  export interface Options extends Config, GlobalLifecycle {}

  export interface AppInfo extends AppConfig, AppLifecycle {}

  export interface Plugin extends Partial<PluginLifecycle> {
    name: string;
    version?: string;
    hooks?: PluginSystem<any>; // Plugin's own plugin
  }

  // You can be extended plug-in type dynamic registration
  export interface Plugins {}
}
