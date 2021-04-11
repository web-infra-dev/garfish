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
  private loading: Record<string, Promise<any> | null> = {};
  public plugins: [];

  constructor(options?: Options) {
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

    hooks.lifecycle.beforeLoad.promise({ name: '', entry: '' }, '');
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

  loadApp(name: string, _opts?: LoadAppOptions) {
    const appInfo = this.appInfos[name];
    assert(appInfo?.entry, `Can't load unexpected module "${name}".`);

    // 复制一份 option 出来
    // opts = isObject(opts)
    //   ? deepMerge(this.options, opts)
    //   : deepMerge(this.options, {});

    // const dispatchEndHook = (app) => {
    //   // this.emit(END_LOAD_APP, app);
    //   // return this.callHooks('afterLoad', opts, [appInfo, opts]);
    // };

    // const asyncLoadProcess = async () => {
    // 如果返回 false 需要阻止加载
    // const noBlockLoading = await this.callHooks('beforeLoad', opts, [
    //   appInfo,
    //   opts,
    // ]);

    // if (noBlockLoading) {
    //   if (noBlockLoading() === false) {
    //     return null;
    //   }
    // }

    // this.emit(BEFORE_LOAD_APP, appInfo, opts);
    //   const cacheApp = this.cacheApps[name];

    //   if (opts.cache && cacheApp) {
    //     await dispatchEndHook(cacheApp);
    //     return cacheApp;
    //   } else {
    //     this.emit(START_LOAD_APP, appInfo);
    //     try {
    //       const app = await this.loader.loadApp(appInfo, opts);
    //       this.cacheApps[name] = app;
    //       await dispatchEndHook(app);
    //       return app;
    //     } catch (e) {
    //       __DEV__ && warn(e);
    //       this.emit(LOAD_APP_ERROR, e);
    //       this.callHooks('errorLoadApp', opts, [e, appInfo]);
    //     } finally {
    //       setRanking(name);
    //       this.loading[name] = null;
    //     }
    //     return null;
    //   }
    // };

    // if (!opts.cache || !this.loading[name]) {
    //   this.loading[name] = asyncLoadProcess();
    // }
    // return this.loading[name];
  }
}
