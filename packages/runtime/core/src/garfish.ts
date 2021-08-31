import {
  warn,
  error,
  assert,
  transformUrl,
  isPlainObject,
  __GARFISH_FLAG__,
} from '@garfish/utils';
import { EventEmitter } from 'events';
import { Loader, TemplateManager, JavaScriptManager } from '@garfish/loader';
import {
  deepMergeConfig,
  filterNestedConfig,
  generateAppOptions,
  createDefaultOptions,
} from './config';
import { App } from './module/app';
import { interfaces } from './interface';
import { fetchStaticResources } from './utils';
import { globalLifecycle } from './hooks/lifecycle';
import { GarfishHMRPlugin } from './plugins/fixHMR';
import { GarfishOptionsLife } from './plugins/lifecycle';
import { GarfishPreloadPlugin } from './plugins/preload';
import { GarfishPerformance } from './plugins/performance';

const DEFAULT_PROPS = new WeakMap();

export class Garfish extends EventEmitter {
  public running = false;
  public version = __VERSION__;
  public flag = __GARFISH_FLAG__; // A unique identifier
  public loader = new Loader();
  public hooks = globalLifecycle();
  public channel = new EventEmitter();
  public options = createDefaultOptions();
  public externals: Record<string, any> = {};
  public appInfos: Record<string, interfaces.AppInfo> = {};
  public activeApps: Array<interfaces.App> = [];
  public cacheApps: Record<string, interfaces.App> = {};

  private registeredPlugins = {};
  private loading: Record<string, Promise<any> | null> = {};

  get props(): Record<string, any> {
    return (this.options && this.options.props) || DEFAULT_PROPS.get(this);
  }

  constructor(options: interfaces.Options) {
    super();
    DEFAULT_PROPS.set(this, {});
    this.setOptions(options);
    this.options.plugins?.forEach((plugin) => this.usePlugin(plugin));
  }

  private setOptions(options: Partial<interfaces.Options>) {
    assert(!this.running, 'Garfish is running, can`t set options');
    if (isPlainObject(options)) {
      this.options = deepMergeConfig(this.options, options);
    }
    return this;
  }

  usePlugin(
    plugin: (context: Garfish) => interfaces.Plugin,
    ...args: Array<any>
  ) {
    assert(typeof plugin === 'function', 'Plugin must be a function.');
    args.unshift(this);
    const pluginConfig = plugin.apply(null, args) as interfaces.Plugin;
    assert(pluginConfig.name, 'The plugin must have a name.');

    if (!this.registeredPlugins[pluginConfig.name]) {
      this.registeredPlugins[pluginConfig.name] = pluginConfig;

      // Register app hooks, Compatible with the old api
      this.activeApps.forEach((app) => app.hooks.usePlugin(pluginConfig));
      for (const key in this.cacheApps) {
        const app = this.cacheApps[key];
        if (!this.activeApps.includes(app)) {
          app.hooks.usePlugin(pluginConfig);
        }
      }
      // Register global hooks
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
        const mainOptions = createDefaultOptions(true);
        options = deepMergeConfig(mainOptions, options);
        options = filterNestedConfig(options);

        // Isolate global app hooks
        this.hooks.usePlugin(GarfishOptionsLife(options)());
        // Register plugins, nested applications have independent life cycles
        options.plugins?.forEach((plugin) =>
          this.hooks.usePlugin(plugin(this)),
        );

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
    this.usePlugin(GarfishOptionsLife(this.options));
    this.usePlugin(GarfishPerformance());
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
    assert(
      this.running,
      '"AppInfo" can only be registered after Garfish is started.',
    );

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
    options?: Pick<
      interfaces.AppInfo,
      Exclude<keyof interfaces.AppInfo, 'name'>
    >,
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
            error(`Entrance wrong type of resource of "${appName}"`);
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

          // Register plugins
          for (const key in this.registeredPlugins) {
            appInstance.hooks.usePlugin(this.registeredPlugins[key]);
          }
          // Cache app
          if (appInfo.cache) {
            this.cacheApps[appName] = appInstance;
          }
        } catch (e) {
          __DEV__ && error(e);
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
