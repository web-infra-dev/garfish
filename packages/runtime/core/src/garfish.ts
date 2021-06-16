import { EventEmitter } from 'events';
import {
  assert,
  isObject,
  deepMerge,
  warn,
  error,
  hasOwn,
  __GARFISH_FLAG__,
} from '@garfish/utils';
import {
  getDefaultOptions,
  lifecycle,
  defaultLoadComponentOptions,
} from './config';
import { Hooks } from './hooks';
import { Loader } from './module/loader';
import { interfaces } from './interface';
import { App } from './module/app';
import { Component } from './module/component';
import GarfishHMRPlugin from './plugins/fixHMR';
import GarfishOptionsLife from './plugins/lifecycle';
import GarfishPreloadPlugin from './plugins/preload';

export class Garfish implements interfaces.Garfish {
  public version = __VERSION__;
  public running = false;
  public flag = __GARFISH_FLAG__; // A unique identifier
  public options = getDefaultOptions();
  public channel = new EventEmitter();
  public appInfos: Record<string, interfaces.AppInfo> = {};
  public activeApps: Record<string, interfaces.App> = {};
  public cacheApps: Record<string, interfaces.App> = {};
  public cacheComponents: Record<string, interfaces.Component> = {};
  private loading: Record<string, Promise<any> | null> = {};
  public plugins: Array<interfaces.Plugin> = [];
  public loader: Loader;
  public hooks: Hooks;
  public externals: Record<string, any> = {};

  constructor(options: interfaces.Options) {
    this.hooks = new Hooks(true);
    this.loader = new Loader();

    // init Garfish options
    this.setOptions(options);

    // register plugins
    options?.plugins.forEach((pluginCb) => {
      this.usePlugin(this.hooks, pluginCb, this);
    });

    this.hooks.lifecycle.initialize.call(this.options);
  }

  private injectOptionalPlugin(options?: interfaces.Options) {
    const defaultPlugin = [GarfishHMRPlugin(), GarfishOptionsLife(options)];
    // Preload plugin
    if (!options.disablePreloadApp) defaultPlugin.push(GarfishPreloadPlugin());

    defaultPlugin.forEach((pluginCb) => {
      this.usePlugin(this.hooks, pluginCb, this);
    });
  }

  public usePlugin(
    hooks,
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
    return hooks.usePlugins(res);
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
      // Nested scene can be repeated registration application, and basic information for the basename、domGetter、lifeCycle
      if (options.nested) {
        const hooks = new Hooks(false);
        this.usePlugin(hooks, GarfishOptionsLife(options));
        [
          'autoRefreshApp',
          'disableStatistics',
          'disablePreloadApp',
          'sandbox',
        ].forEach((key) => {
          if (key in options)
            __DEV__ &&
              error(`Nested scene does not support the configuration ${key}`);
        });

        this.registerApp(
          options.apps?.map((app) => {
            return {
              ...app,
              basename: options?.basename || this.options.basename,
              domGetter: options?.domGetter || this.options.domGetter,
              hooks: hooks,
            };
          }),
        );
        return this;
      }
      __DEV__ &&
        warn('Garfish is already running now, Cannot run Garfish repeatedly.');
    }

    this.hooks.lifecycle.beforeBootstrap.call(this.options);

    this.setOptions(options);

    // register plugins
    options?.plugins?.forEach((pluginCb) => {
      this.usePlugin(this.hooks, pluginCb, this);
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
        ...appInfo,
        ...opts,
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

  public async loadComponent(
    name: string,
    options: interfaces.LoadComponentOptions,
  ): Promise<interfaces.Component> {
    const opts: interfaces.LoadComponentOptions = {
      ...defaultLoadComponentOptions,
      ...options,
    };
    const nameWithVersion = opts?.version ? `${name}@${opts?.version}` : name;
    const asyncLoadProcess = async () => {
      // Existing cache caching logic
      let result = null;
      const cacheComponents = this.cacheComponents[nameWithVersion];
      if (opts.cache && cacheComponents) {
        result = cacheComponents;
      } else {
        const manager = (await this.loader.load(
          opts?.url,
        )) as interfaces.JsResource;
        try {
          result = new Component(this, { name, ...opts }, manager);
          this.cacheComponents[nameWithVersion] = result;
        } catch (e) {
          __DEV__ && error(e);
        } finally {
          this.loading[nameWithVersion] = null;
        }
      }
      return result;
    };

    if (!opts.cache || !this.loading[nameWithVersion]) {
      this.loading[nameWithVersion] = asyncLoadProcess();
    }
    return this.loading[nameWithVersion];
  }

  public setExternal(nameOrExtObj: string | Record<string, any>, value?: any) {
    assert(nameOrExtObj, 'Invalid parameter.');
    if (typeof nameOrExtObj === 'object') {
      for (const key in nameOrExtObj) {
        if (this.externals[key]) {
          __DEV__ && warn(`The "${key}" will be overwritten in external.`);
        }
        this.externals[key] = nameOrExtObj[key];
      }
    } else {
      this.externals[nameOrExtObj] = value;
    }
  }
}
