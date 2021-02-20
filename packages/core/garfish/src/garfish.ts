import { EventEmitter } from 'events';
import router from '@garfish/router';
import Sandbox from '@garfish/sandbox';
import { warn, assert, isObject, deepMerge } from '@garfish/utils';
import { App } from './module/app';
import { Loader } from './module/loader';
import { SnapshotApp } from './module/snapshotApp';
import { startRouter } from './router';
import { __GARFISH_FLAG__ } from './utils';
import { setRanking, loadAppResource } from './preloadApp';
import {
  Options,
  Hooks,
  AppInfo,
  LoadAppOptions,
  getDefaultOptions,
} from './config';
import {
  BOOTSTRAP,
  REGISTER_APP,
  END_LOAD_APP,
  LOAD_APP_ERROR,
  START_LOAD_APP,
  BEFORE_LOAD_APP,
  BEFORE_BOOTSTRAP,
} from './eventTypes';

let GarfishId = 0;

export class Garfish extends EventEmitter {
  public id = GarfishId++;
  public version = __VERSION__;
  public flag = __GARFISH_FLAG__; // 唯一标识符
  public options = getDefaultOptions();
  public running = false;
  public loader = new Loader(this);
  public router: typeof router = router;
  public channel = new EventEmitter();
  public externals: Record<string, any> = {};
  public appInfos: Record<string, AppInfo> = {};
  public activeApps: Array<App | SnapshotApp> = [];
  public apps: Record<string, App | SnapshotApp> = {};

  private cacheApps: Record<string, App | SnapshotApp> = {};
  private loading: Record<string, Promise<App | SnapshotApp> | null> = {};

  get props() {
    return this.options?.props;
  }

  // TODO: run的时候将一些默认值初始化完成
  run(options?: Options) {
    if (this.running) {
      __DEV__ &&
        warn('Garfish is already running now, Cannot run Garfish repeatedly.');
      return this;
    }
    this.emit(BEFORE_BOOTSTRAP, options);

    if (options) {
      // webpack 相关变量的处理
      const webpackAttrs = ['onerror', 'webpackjsonp'];
      if (__DEV__) {
        webpackAttrs.push('webpackHotUpdate');
      }

      const insulationVariable = options.insulationVariable;
      options.insulationVariable = Array.isArray(insulationVariable)
        ? insulationVariable.concat(webpackAttrs)
        : webpackAttrs;

      this.setOptions(options);
    }

    this.registerApp(this.options.apps);
    startRouter(this);
    this.running = true;
    this.emit(BOOTSTRAP, this.options);
    return this;
  }

  setOptions(options: Partial<Options>) {
    assert(!this.running, 'Garfish is running, can`t set options');
    if (isObject(options)) {
      this.options = deepMerge(this.options, options);
    }
    return this;
  }

  // 使用插件
  use(plugin: (...args: Array<any>) => any, ...args: Array<any>) {
    assert(typeof plugin === 'function', 'Plugin must be a function.');
    if ((plugin as any)._registered) {
      __DEV__ && warn('Please do not register the plugin repeatedly.');
      return this;
    }
    args.unshift(this);
    plugin.apply(null, args);
    (plugin as any)._registered = true;
    return this;
  }

  setExternal(nameOrExtObj: string | Record<string, any>, value?: any) {
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
    return this;
  }

  registerApp(list: AppInfo | Array<AppInfo>) {
    const adds = {};
    if (!Array.isArray(list)) {
      list = [list];
    }

    for (const info of list) {
      assert(info.name, 'Miss app.name.');
      if (this.appInfos[info.name]) {
        __DEV__ && warn(`The "${info.name}" app is already registered.`);
      } else {
        adds[info.name] = info;
        this.appInfos[info.name] = info;
      }
    }
    this.emit(REGISTER_APP, adds);
    return this;
  }

  preloadApp(name: string) {
    const appInfo = this.appInfos[name];
    assert(
      appInfo && appInfo.entry,
      `Can't preloadApp unexpected module "${name}".`,
    );
    loadAppResource(this.loader, appInfo);
    return this;
  }

  loadApp(name: string, opts?: LoadAppOptions) {
    const appInfo = this.appInfos[name];
    assert(appInfo?.entry, `Can't load unexpected module "${name}".`);

    // 复制一份 option 出来
    opts = isObject(opts)
      ? deepMerge(this.options, opts)
      : deepMerge(this.options, {});

    const dispatchEndHook = (app) => {
      this.emit(END_LOAD_APP, app);
      return this.callHooks('afterLoad', opts, [appInfo, opts]);
    };

    const asyncLoadProcess = async () => {
      // 如果返回 false 需要阻止加载
      const noBlockLoading = await this.callHooks('beforeLoad', opts, [
        appInfo,
        opts,
      ]);

      if (noBlockLoading) {
        if (noBlockLoading() === false) {
          return null;
        }
      }

      this.emit(BEFORE_LOAD_APP, appInfo, opts);
      const cacheApp = this.cacheApps[name];

      if (opts.cache && cacheApp) {
        await dispatchEndHook(cacheApp);
        return cacheApp;
      } else {
        this.emit(START_LOAD_APP, appInfo);
        try {
          const app = await this.loader.loadApp(appInfo, opts);
          this.cacheApps[name] = app;
          await dispatchEndHook(app);
          return app;
        } catch (e) {
          __DEV__ && warn(e);
          this.emit(LOAD_APP_ERROR, e);
          this.callHooks('errorLoadApp', opts, [e, appInfo]);
        } finally {
          setRanking(name);
          this.loading[name] = null;
        }
        return null;
      }
    };

    if (!opts.cache || !this.loading[name]) {
      this.loading[name] = asyncLoadProcess();
    }
    return this.loading[name];
  }

  getGlobalObject() {
    return Sandbox.getGlobalObject();
  }

  setGlobalValue(key: PropertyKey, value?: any) {
    this.getGlobalObject()[key] = value;
    return this;
  }

  clearEscapeEffect(key: PropertyKey, value?: any) {
    const global = this.getGlobalObject();
    if (key in global) {
      global[key] = value;
    }
    return this;
  }

  // 支持异步调用
  async callHooks<T extends keyof Hooks>(
    name: T,
    options: null | LoadAppOptions,
    args: Parameters<Hooks[T]>,
  ) {
    const fn = (options || this.options)[name];
    if (typeof fn === 'function') {
      const result = await fn.apply(null, args || []);
      return () => result as CombinePromise<ReturnType<Hooks[T]>>;
    }
    return false;
  }
}
