import {
  warn,
  error,
  assert,
  transformUrl,
  isPlainObject,
  __GARFISH_FLAG__,
} from '@garfish/utils';
import { EventEmitter } from 'events';
import { SyncHook, AsyncHook, PluginSystem } from '@garfish/hooks';
import { Loader, TemplateManager, JavaScriptManager } from '@garfish/loader';
import {
  deepMergeConfig,
  filterNestedConfig,
  generateAppOptions,
  createDefaultOptions,
} from './config';
import { App } from './app';
import { interfaces } from './interface';
import { globalLifecycle } from './lifecycle';
import { fetchStaticResources } from './utils';
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

  private allApps = new Set<interfaces.App>(); // TODO: use WeakRef
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
    assert(typeof plugin === 'function', 'Plugin must be a function.');
    args.unshift(this);
    const pluginConfig = plugin.apply(null, args) as interfaces.Plugin;
    assert(pluginConfig.name, 'The plugin must have a name.');

    if (!this.plugins[pluginConfig.name]) {
      this.plugins[pluginConfig.name] = pluginConfig;

      // Register hooks, Compatible with the old api
      this.hooks.usePlugin(pluginConfig);
      this.allApps.forEach((app) => app.hooks.usePlugin(pluginConfig));
    } else if (__DEV__) {
      warn('Please do not register the plugin repeatedly.');
    }
    return this;
  }

  run(options: interfaces.Options = {}) {
    if (this.running) {
      // Nested scene can be repeated registration application
      if (options.nested) {
        const mainOptions = createDefaultOptions(true);
        options = deepMergeConfig(mainOptions, options);
        options = filterNestedConfig(options);

        // `pluginName` is unique
        this.usePlugin(
          GarfishOptionsLife(options, `nested-lifecycle-${numberOfNesting++}`),
        );
        options.plugins?.forEach((plugin) => this.usePlugin(plugin));

        if (options.apps) {
          this.registerApp(
            options.apps.map((appInfo) => {
              const appConf = deepMergeConfig(options, appInfo);
              appConf.nested = true;
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
    this.usePlugin(GarfishOptionsLife(this.options, 'global-lifecycle'));
    if (!this.options.disablePreloadApp) {
      this.usePlugin(GarfishPreloadPlugin());
    }
    options.plugins?.forEach((plugin) => this.usePlugin(plugin, this));

    // Emit hooks and register apps
    this.hooks.lifecycle.beforeBootstrap.emit(this.options);
    this.running = true;
    this.registerApp(this.options.apps || []);
    this.hooks.lifecycle.bootstrap.emit(this.options);
    return this;
  }

  registerApp(list: interfaces.AppInfo | Array<interfaces.AppInfo>) {
    if (!this.running) {
      // TODO: throw error
      warn('"AppInfo" can only be registered after Garfish is started.');
    }

    const currentAdds = {};
    this.hooks.lifecycle.beforeRegisterApp.emit(list);
    if (!Array.isArray(list)) list = [list];

    for (let appInfo of list) {
      assert(appInfo.name, 'Miss app.name.');
      if (!this.appInfos[appInfo.name]) {
        assert(
          appInfo.entry,
          `${appInfo.name} application entry is not url: ${appInfo.entry}`,
        );
        // Deep merge this.options
        if (!appInfo.nested) {
          appInfo = deepMergeConfig(this.options, appInfo);
        }
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
    options?: Omit<interfaces.AppInfo, 'name'>,
  ): Promise<interfaces.App | null> {
    assert(appName, 'Miss appName.');
    const appInfo = await generateAppOptions(appName, this, options);

    const asyncLoadProcess = async () => {
      // Return not undefined type data directly to end loading
      const stop = await this.hooks.lifecycle.beforeLoad.emit(appInfo);
      if (stop === false) {
        warn(`Load ${appName} application is terminated by beforeLoad.`);
        return null;
      }
      // Existing cache caching logic
      let appInstance = null;
      const cacheApp = this.cacheApps[appName];
      if (appInfo.cache && cacheApp) {
        appInstance = cacheApp;
      } else {
        try {
          let isHtmlMode, fakeEntryManager;
          const resources = { js: [], link: [], modules: [] }; // Default resources
          const { resourceManager: entryManager } = await this.loader.load(
            appName,
            transformUrl(location.href, appInfo.entry),
          );

          // Html entry
          if (entryManager instanceof TemplateManager) {
            isHtmlMode = true;
            const [js, link, modules] = await fetchStaticResources(
              appName,
              this.loader,
              entryManager,
            );
            resources.js = js;
            resources.link = link;
            resources.modules = modules;
          } else if (entryManager instanceof JavaScriptManager) {
            // Js entry
            isHtmlMode = false;
            const mockTemplateCode = `<script src="${entryManager.url}"></script>`;
            fakeEntryManager = new TemplateManager(
              mockTemplateCode,
              entryManager.url,
            );
            entryManager.setDep(fakeEntryManager.findAllJsNodes()[0]);
            resources.js = [entryManager];
          } else {
            error(`Entrance wrong type of resource of "${appName}".`);
          }

          const manager = fakeEntryManager || entryManager;

          appInstance = new App(
            this,
            appInfo,
            manager,
            resources,
            isHtmlMode,
            this.options.customLoader,
          );

          this.allApps.add(appInstance);
          if (appInfo.cache) {
            this.cacheApps[appName] = appInstance;
          }
          // Register plugins to app
          for (const key in this.plugins) {
            appInstance.hooks.usePlugin(this.plugins[key]);
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
