import { hooks, Plugin } from '../utils/hooks';
import { getDefaultOptions } from '../config';
import { Options, AppInfo, LoadAppOptions } from '../type';
import {
  assert,
  isObject,
  deepMerge,
  warn,
  error,
  validURL,
} from '@garfish/utils';

export class Garfish {
  public version = __VERSION__;
  private running = false;
  public options = getDefaultOptions();
  public externals: Record<string, any> = {};
  public appInfos: Record<string, AppInfo> = {};
  public activeApps: Array<any> = [];
  private cacheApps: Record<string, any> = {};
  private loading: Record<string, Promise<any> | null> = {};
  public plugins: [];
  public loader: any;

  constructor(options?: Options) {
    hooks.lifecycle.beforeInitialize.call(this, this.options);
    // init Garfish instance
    this.setOptions(options);
    hooks.lifecycle.initialize.call(this, this.options);
  }

  static usePlugin(plugin: () => Plugin, ...args: Array<any>) {
    assert(typeof plugin === 'function', 'Plugin must be a function.');
    if ((plugin as any)._registered) {
      __DEV__ && warn('Please do not register the plugin repeatedly.');
      return this;
    }
    (plugin as any)._registered = true;
    return hooks.usePlugins(plugin.apply(null, args));
  }

  public setOptions(options: Partial<Options>) {
    assert(!this.running, 'Garfish is running, can`t set options');
    if (isObject(options)) {
      this.options = deepMerge(this.options, options);
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
    hooks.lifecycle.bootstrap.call(this, this.options);
    this.running = true;
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

  async loadApp(name: string, opts?: LoadAppOptions) {
    const appInfo = this.appInfos[name];
    assert(appInfo?.entry, `Can't load unexpected module "${name}".`);

    // deep copy option
    opts = isObject(opts)
      ? deepMerge(this.options, opts)
      : deepMerge(this.options, {});

    const asyncLoadProcess = async () => {
      let result = null;

      // 返回非undefined类型数据直接终止， hooks约定
      const stopLoad = await hooks.lifecycle.beforeLoad.promise(
        this,
        appInfo,
        opts,
      );
      if (stopLoad !== undefined) {
        warn(`Load ${name} application is terminated by beforeLoad`);
        return null;
      }

      const cacheApp = this.cacheApps[name];

      if (opts.cache && cacheApp) {
        result = cacheApp;
      } else {
        try {
          const app = await this.loader.loadApp(appInfo, opts);
          this.cacheApps[name] = app;
          result = app;
        } catch (e) {
          __DEV__ && warn(e);
          hooks.lifecycle.errorLoadApp.call(this, appInfo, opts, e);
          return null;
        } finally {
          // setRanking(name);
          this.loading[name] = null;
        }
      }
      await hooks.lifecycle.afterLoad.promise(this, appInfo, opts);
      return result;
    };

    if (!opts.cache || !this.loading[name]) {
      this.loading[name] = asyncLoadProcess();
    }
    return this.loading[name];
  }
}
