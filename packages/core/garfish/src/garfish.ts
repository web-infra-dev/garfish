import { EventEmitter } from 'events';
import router from '@garfish/router';
import SandBox from '@garfish/sandbox';
import { warn, assert } from '@garfish/utils';
import { App } from './module/app';
import { Loader } from './module/loader';
import { SnapshotApp } from './module/snapshotApp';
import { startRouter } from './router';
import { __GARFISH_FLAG__ } from './utils';
import { setRanking, loadAppResource } from './preloadApp';
import { Options, AppInfo, DefaultOptions, LoadAppOptions } from './config';
import {
  BOOTSTRAP,
  REGISTER_APP,
  END_LOAD_APP,
  LOAD_APP_ERROR,
  START_LOAD_APP,
  BEFORE_LOAD_APP,
  BEFORE_BOOTSTRAP,
} from './eventFlags';

let GarfishId = 0;

// 因为要兼容旧的语法和行为，loader 和 channel 不能删除
export class Garfish extends EventEmitter {
  public id = GarfishId++;
  public running: boolean;
  public version = __VERSION__;
  public flag = __GARFISH_FLAG__; // 唯一标识符
  public options = DefaultOptions;
  public router: typeof router = router;
  public externals: Record<string, any> = {};
  public loader = new Loader(this);
  public channel = new EventEmitter();
  public appInfos: Record<string, AppInfo> = {};
  public activeApps: Array<App | SnapshotApp> = [];
  public apps: Record<string, App | SnapshotApp> = {};

  private cacheApps: Record<string, App | SnapshotApp> = {};
  private loading: Record<string, Promise<App | SnapshotApp> | null> = {};

  constructor(options: Options) {
    super();
    this.running = false;
    this.setOptions(options);
  }

  run(options?: Options) {
    if (this.running) {
      __DEV__ &&
        warn('Garfish is already running now, Cannot run Garfish repeatedly.');
      return this;
    }
    this.emit(BEFORE_BOOTSTRAP, options);
    if (options) {
      // webpack 相关变量的处理
      const webpackAttrs = __DEV__
        ? ['webpackjsonp', 'webpackHotUpdate']
        : ['webpackjsonp'];

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

  setOptions(options: Options) {
    assert(!this.running, 'Garfish is running, can`t set options');
    if (options) {
      Object.assign(this.options, options);
    }
    return this;
  }

  // 使用插件
  use(plugin: Function, ...args: Array<any>) {
    assert(typeof plugin === 'function', 'Plugin must be a function.');
    if ((plugin as any)._registered) {
      __DEV__ && warn('Please do not register the plugin repeatedly.');
      return;
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
      assert(info.name, 'Lack app.name.');
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

  // 预加载 app 资源
  preloadApp(name: string) {
    const appInfo = this.appInfos[name];
    assert(
      appInfo && appInfo.entry,
      `Can't preloadApp unexpected module "${name}".`,
    );
    loadAppResource(this.loader, appInfo);
  }

  // loadApp 不调用 mount 方法其实就是预加载了 app
  async loadApp(name: string, opts: LoadAppOptions = {}) {
    const appInfo = this.appInfos[name];
    assert(appInfo && appInfo.entry, `Can't load unexpected module "${name}".`);

    // merge options
    opts = {
      ...this.options,
      ...opts,
      sandbox: {
        ...this.options.sandbox,
        ...(opts.sandbox || {}),
        modules: {
          ...this.options.sandbox.modules,
          ...(opts.sandbox?.modules || {}),
        },
      },
    };

    // beforeLoad 钩子返回 false，就阻止加载
    const allowLoad = await this.callHooks('beforeLoad', [appInfo, opts]);
    if (allowLoad && allowLoad() === false) {
      return null;
    }

    this.emit(BEFORE_LOAD_APP, appInfo, opts);

    const cache = opts.cache;
    if (cache && this.cacheApps[name]) {
      return this.cacheApps[name];
    }

    this.emit(START_LOAD_APP, appInfo);

    try {
      let app: App | SnapshotApp;
      if (cache) {
        let loadingApp = this.loading[name];
        if (!loadingApp) {
          loadingApp = this.loader.loadApp(appInfo, opts);
          this.loading[name] = loadingApp;
        }
        app = await loadingApp;
        this.cacheApps[name] = app;
      } else {
        // 如果没有 cache，就需要用户自己去处理 loading 的副作用
        app = await this.loader.loadApp(appInfo, opts);
      }

      this.emit(END_LOAD_APP, app);
      return app;
    } catch (e) {
      this.emit(LOAD_APP_ERROR, e);
      await this.callHooks('errorLoadApp', [e, appInfo]);
    } finally {
      setRanking(name);
      this.loading[name] = null;
    }
    return null;
  }

  getGlobalObject() {
    return SandBox.getGlobalObject();
  }

  // set 一些变量到全局的 window 上
  setGlobalValue(key: string | symbol, value?: any) {
    assert(key, 'Invalid key.');
    this.getGlobalObject()[key] = value;
    return this;
  }

  // 一些通过沙箱漏掉逃逸到 window 上的变量，可以通过这个方法清除
  clearEscapeEffect(key: string | symbol, value?: any) {
    assert(key, 'Invalid key.');
    const global = this.getGlobalObject();
    if (key in global) {
      global[key] = value;
    }
    return this;
  }

  // 支持异步调用
  async callHooks(name: string, args?: Array<any>) {
    const fn = this.options[name];
    if (typeof fn === 'function') {
      const res = await fn.apply(null, args || []);
      return () => res;
    }
    return false;
  }
}
