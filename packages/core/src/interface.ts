import { PluginSystem } from '@garfish/hooks';
import * as LoaderInterface from '@garfish/loader';
import { Garfish } from './garfish';
import { App, CustomerLoader } from './module/app';
import { appLifecycle, globalLifecycle } from './lifecycle';

type AppInterface = App;
type GarfishInterface = Garfish;

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
    apps?: Array<AppInfo>;
    disableStatistics?: boolean;
    disablePreloadApp?: boolean;
    plugins?: Array<(context: Garfish) => Plugin>;
  }

  export interface AppGlobalConfig {
    basename?: string;
    nested?: boolean;
    domGetter?: DomGetter;
    props?: Record<string, any>;
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

  export type AppConfig = Partial<AppGlobalConfig> & {
    name: string;
    entry?: string;
    cache?: boolean;
    nested?: any;
    noCheckProvider?: boolean;
  };

  export interface Options extends Config, AppGlobalConfig, GlobalLifecycle {}

  export interface AppInfo extends AppConfig, AppLifecycle {}

  export interface Plugin extends Partial<PluginLifecycle> {
    name: string;
    version?: string;
    hooks?: PluginSystem<any>; // Plugin's own plugin
  }

  // You can be extended plug-in type dynamic registration
  export interface Plugins {}
}
