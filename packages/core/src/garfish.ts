import { EventEmitter } from 'events';
import { Loader } from '@garfish/loader';
import { SyncHook, AsyncHook, PluginSystem } from '@garfish/hooks';
import { warn, assert, isPlainObject, __GARFISH_FLAG__ } from '@garfish/utils';
import {
  deepMergeConfig,
  filterNestedConfig,
  generateAppOptions,
  createDefaultOptions,
} from './config';
import { App } from './module/app';
import { interfaces } from './interface';
import { globalLifecycle } from './lifecycle';
import { processAppResources } from './module/resource';
import { GarfishHMRPlugin } from './plugins/fixHMR';
import { GarfishOptionsLife } from './plugins/lifecycle';
import { GarfishPreloadPlugin } from './plugins/preload';
import { GarfishPerformance } from './plugins/performance';

let numberOfNesting = 0;
const DEFAULT_PROPS = new WeakMap();
const HOOKS_API = { SyncHook, AsyncHook };

export class Garfish extends EventEmitter {
  public running = false;
  public version = __VERSION__;
  public flag = __GARFISH_FLAG__; // A unique identifier
  public loader = new Loader();
  public hooks = globalLifecycle();
  public channel = new EventEmitter();
  public options = createDefaultOptions();
  public externals: Record<string, any> = {};
  public activeApps: Array<interfaces.App> = [];
  public plugins: interfaces.Plugins = {} as any;
  public cacheApps: Record<string, interfaces.App> = {};
  public appInfos: Record<string, interfaces.AppInfo> = {};

  private nestedSwitch = false;
  private loading: Record<string, Promise<any> | null> = {};

  get props(): Record<string, any> {
    return (this.options && this.options.props) || DEFAULT_PROPS.get(this);
  }

  constructor(options: interfaces.Options) {
    super();
    this.setOptions(options);
    DEFAULT_PROPS.set(this, {});
    this.options.plugins?.forEach((plugin) => this.usePlugin(plugin));
  }

  private setOptions(options: Partial<interfaces.Options>) {
    assert(!this.running, 'Garfish is running, can`t set options');
    if (isPlainObject(options)) {
      this.options = deepMergeConfig(this.options, options);
    }
    return this;
  }

  createPluginSystem<T extends (api: typeof HOOKS_API) => any>(callback: T) {
    const hooks = callback(HOOKS_API);
    return new PluginSystem<ReturnType<T>>(hooks);
  }

  usePlugin(
    plugin: (context: Garfish) => interfaces.Plugin,
    ...args: Array<any>
  ) {
    if (!this.nestedSwitch) {
      assert(!this.running, 'Cannot register plugin after Garfish is started.');
    }
    assert(typeof plugin === 'function', 'Plugin must be a function.');
    args.unshift(this);
    const pluginConfig = plugin.apply(null, args) as interfaces.Plugin;
    assert(pluginConfig.name, 'The plugin must have a name.');

    if (!this.plugins[pluginConfig.name]) {
      this.plugins[pluginConfig.name] = pluginConfig;
      // Register hooks, Compatible with the old api
      this.hooks.usePlugin(pluginConfig);
    } else if (__DEV__) {
      warn('Please do not register the plugin repeatedly.');
    }
    return this;
  }

  run(options: interfaces.Options = {}) {
    if (this.running) {
      // Nested scene can be repeated registration application
      if (options.nested) {
        numberOfNesting++;
        const mainOptions = createDefaultOptions(true);
        options = deepMergeConfig(mainOptions, options);
        options = filterNestedConfig(this, options, numberOfNesting);

        this.nestedSwitch = true;
        options.plugins?.forEach((plugin) => this.usePlugin(plugin));
        // `pluginName` is unique
        this.usePlugin(
          GarfishOptionsLife(options, `nested-lifecycle-${numberOfNesting}`),
        );
        this.nestedSwitch = false;

        if (options.apps) {
          this.registerApp(
            options.apps.map((appInfo) => {
              const appConf = deepMergeConfig<interfaces.AppInfo>(
                options,
                appInfo,
              );
              appConf.nested = numberOfNesting;
              // Now we only allow the same sandbox configuration to be used globally
              appConf.sandbox = this.options.sandbox;
              return appConf;
            }),
          );
        }
      } else if (__DEV__) {
        warn('Garfish is already running now, Cannot run Garfish repeatedly.');
      }
      return this;
    }

    this.setOptions(options);
    // Register plugins
    this.usePlugin(GarfishHMRPlugin());
    this.usePlugin(GarfishPerformance());
    if (!this.options.disablePreloadApp) {
      this.usePlugin(GarfishPreloadPlugin());
    }
    options.plugins?.forEach((plugin) => this.usePlugin(plugin, this));
    // Put the lifecycle plugin at the end, so that you can get the changes of other plugins
    this.usePlugin(GarfishOptionsLife(this.options, 'global-lifecycle'));

    // Emit hooks and register apps
    this.hooks.lifecycle.beforeBootstrap.emit(this.options);
    this.running = true;
    this.registerApp(this.options.apps || []);
    this.hooks.lifecycle.bootstrap.emit(this.options);
    return this;
  }

  registerApp(list: interfaces.AppInfo | Array<interfaces.AppInfo>) {
    const currentAdds = {};
    this.hooks.lifecycle.beforeRegisterApp.emit(list);
    if (!Array.isArray(list)) list = [list];

    for (const appInfo of list) {
      assert(appInfo.name, 'Miss app.name.');
      if (!this.appInfos[appInfo.name]) {
        assert(
          appInfo.entry,
          `${appInfo.name} application entry is not url: ${appInfo.entry}`,
        );
        currentAdds[appInfo.name] = appInfo;
        this.appInfos[appInfo.name] = appInfo;
      } else if (__DEV__) {
        warn(`The "${appInfo.name}" app is already registered.`);
      }
    }
    this.hooks.lifecycle.registerApp.emit(currentAdds);
    return this;
  }

  setExternal(nameOrExtObj: string | Record<string, any>, value?: any) {
    assert(nameOrExtObj, 'Invalid parameter.');
    if (typeof nameOrExtObj === 'object') {
      for (const key in nameOrExtObj) {
        if (__DEV__) {
          this.externals[key] &&
            warn(`The "${key}" will be overwritten in external.`);
        }
        this.externals[key] = nameOrExtObj[key];
      }
    } else {
      this.externals[nameOrExtObj] = value;
    }
    return this;
  }

  async loadApp(
    appName: string,
    optionsOrUrl?: Omit<interfaces.AppInfo, 'name'>,
  ): Promise<interfaces.App | null> {
    assert(appName, 'Miss appName.');
    const appInfo = generateAppOptions(appName, this, optionsOrUrl);

    const asyncLoadProcess = async () => {
      // Return not undefined type data directly to end loading
      const stop = await this.hooks.lifecycle.beforeLoad.emit(appInfo);
      if (stop === false) {
        warn(`Load ${appName} application is terminated by beforeLoad.`);
        return null;
      }
      // Existing cache caching logic
      let appInstance: interfaces.App = null;
      const cacheApp = this.cacheApps[appName];
      if (appInfo.cache && cacheApp) {
        appInstance = cacheApp;
      } else {
        try {
          const [manager, resources, isHtmlMode] = await processAppResources(
            this.loader,
            appInfo,
          );

          appInstance = new App(
            this,
            appInfo,
            manager,
            resources,
            isHtmlMode,
            appInfo.customLoader,
          );

          // The registration hook will automatically remove the duplication
          for (const key in this.plugins) {
            appInstance.hooks.usePlugin(this.plugins[key]);
          }
          if (appInfo.cache) {
            this.cacheApps[appName] = appInstance;
          }
        } catch (e) {
          __DEV__ && warn(e);
          this.hooks.lifecycle.errorLoadApp.emit(e, appInfo);
        } finally {
          this.loading[appName] = null;
        }
      }
      this.hooks.lifecycle.afterLoad.emit(appInfo, appInstance);
      return appInstance;
    };

    if (!appInfo.cache || !this.loading[appName]) {
      this.loading[appName] = asyncLoadProcess();
    }
    return this.loading[appName];
  }
}
