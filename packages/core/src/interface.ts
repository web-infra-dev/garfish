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
    | string
    | (() => Element | null)
    | (() => Promise<Element>);

  export interface LoaderResult {
    mount: interfaces.Provider['render'];
    unmount: interfaces.Provider['destroy'];
  }

  export interface AppRenderInfo {
    isMount?: boolean;
    isUnmount?: boolean;
  }

  export interface Provider {
    destroy: ({
      appName,
      dom,
      appRenderInfo,
      props,
    }: {
      appName: string;
      dom: Element | ShadowRoot | Document;
      appRenderInfo: AppRenderInfo;
      props?: Record<string, any>;
    }) => void;
    render: ({
      appName,
      dom,
      basename,
      appRenderInfo,
      props,
    }: {
      appName: String;
      dom: Element | ShadowRoot | Document;
      basename?: string;
      appRenderInfo: AppRenderInfo;
      props?: Record<string, any>;
    }) => void;
  }

  export interface SandboxConfig {
    open?: boolean;
    snapshot?: boolean;
    fixBaseUrl?: boolean;
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
    customLoader?: CustomerLoader;
    loader?: LoaderInterface.LoaderLifecycle;
  }

  export type AppLifecycle = Pick<
    GlobalLifecycle,
    keyof AppHooks['lifecycle']
  > & {
    customLoader?: CustomerLoader;
  };

  export type AppConfig = Partial<AppGlobalConfig> & {
    name: string;
    entry: string;
    cache?: boolean;
    activeWhen?: string | ((path: string) => boolean);
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

  // You can be extended plugin type dynamic registration
  export interface Plugins {}

  export interface ExecScriptOptions {
    node?: Node;
    async?: boolean;
    noEntry?: boolean;
    isInline?: boolean;
    isModule?: boolean;
    originScript?: HTMLScriptElement
  }

  export interface ChildGarfishConfig {
    sandbox?: {
      noEntryScripts?: string[];
    }
  }
}
