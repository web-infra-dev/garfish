import { Plugin, Hooks, hooks } from '../plugin/hooks';
import { getDefaultOptions } from '../config';
import { Options, AppInfo, LoadAppOptions } from '../type';
import {
  assert,
  isObject,
  deepMerge,
  warn,
  error,
  validURL,
  hasOwn,
} from '@garfish/utils';
import { Loader } from '../module/loader';
import { getRenderNode } from '../utils';
import { lazyInject, TYPES, injectable } from '../ioc/container';
import { interfaces } from '../interface';

@injectable()
export class Garfish {
  public version = __VERSION__;
  private running = false;
  public options = getDefaultOptions();
  public externals: Record<string, any> = {};
  public appInfos: Record<string, AppInfo> = {};
  public activeApps: Array<any> = [];
  private cacheApps: Record<string, any> = {};
  private loading: Record<string, Promise<any> | null> = {};
  public plugins: Array<(context: Garfish) => Plugin> = [];

  @lazyInject(TYPES.Loader)
  public loader: interfaces.Loader;

  @lazyInject(TYPES.Hooks)
  public hooks: interfaces.Hooks;

  constructor(options?: Options) {
    // register plugins
    options?.plugins.forEach((pluginCb) => {
      this.usePlugin(pluginCb, this);
    });

    hooks.lifecycle.beforeInitialize.call(this, this.options);
    // init Garfish options
    this.setOptions(options);
    hooks.lifecycle.initialize.call(this, this.options);
  }

  public usePlugin(
    plugin: (context: Garfish) => Plugin,
    context: Garfish,
    ...args: Array<any>
  ) {
    assert(typeof plugin === 'function', 'Plugin must be a function.');
    if ((plugin as any)._registered) {
      __DEV__ && warn('Please do not register the plugin repeatedly.');
      return this;
    }
    (plugin as any)._registered = true;
    return hooks.usePlugins(plugin.apply(this, [context, ...args]));
  }

  public setOptions(options: Partial<Options>) {
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

  public async run(options?: Options) {
    if (this.running) {
      __DEV__ &&
        warn('Garfish is already running now, Cannot run Garfish repeatedly.');
      return this;
    }
    hooks.lifecycle.beforeBootstrap.call(this, this.options);

    this.setOptions(options);
    this.running = true;

    hooks.lifecycle.bootstrap.call(this, this.options);
  }

  public registerApp(list: AppInfo | Array<AppInfo>) {
    hooks.lifecycle.beforeRegisterApp.call(this, list);

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
          !validURL(info.entry),
          `${info.name} application entry is not url`,
        );
        adds[info.name] = info;
        this.appInfos[info.name] = info;
      }
    }

    hooks.lifecycle.registerApp.call(this, list);
    return this;
  }

  // // TODO: 1. loader增加preload权重 2.
  public async loadApp(opts: LoadAppOptions) {
    let appInfo = this.appInfos[opts.name];
    const appName = opts.name;

    // Does not support does not have remote resources and no registered application
    assert(
      !(!appInfo && !opts.entry),
      `Can't load unexpected module "${appName}". Please provide the entry parameters or registered in advance of the app`,
    );

    // Pretreatment parameters, and the default cache
    if (!appInfo) {
      appInfo = { cache: true, ...opts };
    }
    appInfo.domGetter = getRenderNode(appInfo.domGetter);

    const asyncLoadProcess = async () => {
      //  Return not undefined type data directly to end loading
      const stopLoad = await hooks.lifecycle.beforeLoad.promise(this, appInfo);
      if (stopLoad !== undefined) {
        warn(`Load ${appName} application is terminated by beforeLoad`);
        return null;
      }

      // Existing cache caching logic
      let result = null;
      const cacheApp = this.cacheApps[appName];
      if (opts.cache && cacheApp) {
        result = cacheApp;
      } else {
        try {
          // @ts-ignore
          result = await this.loader.loadApp(appInfo);
          this.cacheApps[appName] = result;
        } catch (e) {
          __DEV__ && error(e);
          hooks.lifecycle.errorLoadApp.call(this, appInfo, e);
        } finally {
          this.loading[appName] = null;
        }
      }
      await hooks.lifecycle.afterLoad.promise(this, appInfo);
      return result;
    };

    if (!opts.cache || !this.loading[appName]) {
      this.loading[appName] = asyncLoadProcess();
    }
    return this.loading[appName];
  }
}
