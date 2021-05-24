import { Hooks } from './hooks';
import { getDefaultOptions } from './config';
import {
  assert,
  isObject,
  deepMerge,
  warn,
  error,
  validURL,
  hasOwn,
  def,
} from '@garfish/utils';
import { Loader } from './module/loader';
import { interfaces } from './interface';
import { App } from './module/app';
import GarfishBrowserVm from '@garfish/browser-vm';
import GarfishBrowserSnapshot from '@garfish/browser-snapshot';
import GarfishPreloadPlugin from './plugins/preload';
import { RouterInterface } from 'packages/runtime/router/src/context';
import { __GARFISH_FLAG__ } from './utils/tool';

export class Garfish implements interfaces.Garfish {
  public version = __VERSION__;
  private running = false;
  public flag = __GARFISH_FLAG__; // A unique identifier
  public options = getDefaultOptions();
  public appInfos: Record<string, interfaces.AppInfo> = {};
  public activeApps: Record<string, interfaces.App> = {};
  public cacheApps: Record<string, interfaces.App> = {};
  private loading: Record<string, Promise<any> | null> = {};
  public plugins: Array<interfaces.Plugin> = [];
  public loader: Loader;
  public hooks: Hooks;
  public subInstances: Record<string, Garfish> = {};

  router: RouterInterface;
  setExternal: (
    nameOrExtObj: string | Record<string, any>,
    value?: any,
  ) => void;
  externals: Record<string, any>;

  constructor(options: interfaces.Options) {
    this.hooks = new Hooks();
    this.loader = new Loader();

    // init Garfish options
    this.setOptions(options);

    // register plugins
    options?.plugins.forEach((pluginCb) => {
      this.usePlugin(pluginCb, this);
    });

    this.hooks.lifecycle.initialize.call(this.options);
  }

  private injectOptionalPlugin(options?: interfaces.Options) {
    const defaultPlugin = [];
    // Preload plugin
    if (!options.disablePreloadApp) defaultPlugin.push(GarfishPreloadPlugin());

    // The open set to false, just said to close the sandbox
    const noSandbox = options.sandbox?.open === false;
    const useBrowserVm = options?.sandbox?.snapshot === false;

    // Add the sandbox plug-in
    if (!noSandbox) {
      // The current environment without setting the proxy and the use of vm sandbox to open it
      if (window.Proxy && useBrowserVm) {
        defaultPlugin.push(GarfishBrowserVm());
      } else {
        if (!window.Proxy && useBrowserVm) {
          warn(
            'Due to the current environment without the proxy, does not support the vm sandbox, if to maintain its normal operation in the current environment, please pass the sandbox snapshot parameter switch to the sandbox',
          );
        }
        defaultPlugin.push(GarfishBrowserSnapshot());
      }
    }

    defaultPlugin.forEach((pluginCb) => {
      this.usePlugin(pluginCb, this);
    });
  }

  private usePlugin(
    plugin: (context: Garfish) => interfaces.Plugin,
    ...args: Array<any>
  ) {
    assert(typeof plugin === 'function', 'Plugin must be a function.');
    if ((plugin as any)._registered) {
      __DEV__ && warn('Please do not register the plugin repeatedly.');
      return this;
    }
    (plugin as any)._registered = true;
    const res = plugin.apply(this, [this, ...args]);
    this.plugins.push(res);
    return this.hooks.usePlugins(res);
  }

  public setOptions(options: Partial<interfaces.Options>) {
    assert(!this.running, 'Garfish is running, can`t set options');
    if (isObject(options)) {
      this.options = deepMerge(this.options, options);
      // register apps
      this.registerApp(options.apps || []);
      // Index object can't deep copy otherwise unable to communicate
      if (hasOwn(options, 'props')) {
        this.options.props = options.props;
      }
    }
    return this;
  }

  public async run(options?: interfaces.Options) {
    if (this.running) {
      __DEV__ &&
        warn('Garfish is already running now, Cannot run Garfish repeatedly.');
      return this;
    }

    // Nested scene add logo
    if (options.nested) {
      def(window, '__GARFISH__PARENT__', true);
    }

    this.hooks.lifecycle.beforeBootstrap.call(this.options);

    this.setOptions(options);

    // register plugins
    options?.plugins.forEach((pluginCb) => {
      this.usePlugin(pluginCb, this);
    });

    this.injectOptionalPlugin(options);
    this.running = true;

    this.hooks.lifecycle.bootstrap.call(this.options);
  }

  public registerApp(list: interfaces.AppInfo | Array<interfaces.AppInfo>) {
    this.hooks.lifecycle.beforeRegisterApp.call(list);

    const adds = {};
    if (!Array.isArray(list)) {
      list = [list];
    }

    for (const info of list) {
      assert(info.name, 'Miss app.name.');
      if (this.appInfos[info.name]) {
        __DEV__ && warn(`The "${info.name}" app is already registered.`);
      } else {
        assert(
          info.entry,
          `${info.name} application entry is not url: ${info.entry}`,
        );
        adds[info.name] = info;
        this.appInfos[info.name] = info;
      }
    }

    this.hooks.lifecycle.registerApp.call(this.appInfos);
    return this;
  }

  public async loadApp(
    name: string,
    opts: interfaces.LoadAppOptions,
  ): Promise<interfaces.App> {
    let appInfo = this.appInfos[name];

    // Does not support does not have remote resources and no registered application
    assert(
      !(!appInfo && !opts.entry),
      `Can't load unexpected module "${name}". Please provide the entry parameters or registered in advance of the app`,
    );

    // Pretreatment parameters, and the default cache
    if (!appInfo) {
      appInfo = { name, cache: true, ...opts };
    } else {
      appInfo = {
        cache: true,
        ...opts,
        ...appInfo,
      };
    }

    const asyncLoadProcess = async () => {
      // let AppConstructor = null;
      //  Return not undefined type data directly to end loading
      const stopLoad = await this.hooks.lifecycle.beforeLoad.promise(appInfo);
      if (stopLoad === false) {
        warn(`Load ${name} application is terminated by beforeLoad`);
        return null;
      }

      // Existing cache caching logic
      let result = null;
      const cacheApp = this.cacheApps[name];
      if (opts.cache && cacheApp) {
        result = cacheApp;
      } else {
        try {
          const {
            manager,
            isHtmlMode,
            resources,
          } = await this.loader.loadAppSources(appInfo);
          this.hooks.lifecycle.processResource.call(
            appInfo,
            manager,
            resources,
          );

          result = new App(
            this,
            appInfo,
            manager,
            resources,
            isHtmlMode,
            this.options.customLoader,
          );
          this.cacheApps[name] = result;
        } catch (e) {
          __DEV__ && error(e);
          this.hooks.lifecycle.errorLoadApp.call(appInfo, e);
        } finally {
          this.loading[name] = null;
        }
      }
      this.hooks.lifecycle.afterLoad.call(appInfo, result);
      return result;
    };

    if (!opts.cache || !this.loading[name]) {
      this.loading[name] = asyncLoadProcess();
    }
    return this.loading[name];
  }
}
