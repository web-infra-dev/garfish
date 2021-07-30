import {
  warn,
  error,
  assert,
  transformUrl,
  isPlainObject,
  getRenderNode,
  __GARFISH_FLAG__,
} from '@garfish/utils';
import { EventEmitter } from 'events';
import { Loader, TemplateManager, JavaScriptManager } from '@garfish/loader';
import {
  mergeConfig,
  filterNestedConfig,
  filterGlobalConfig,
  createDefaultOptions,
} from './config';
import { Hooks } from './hooks';
import { interfaces } from './interface';
import { App, AppInfo } from './module/app';
import { fetchStaticResources } from './utils';
import { GarfishHMRPlugin } from './plugins/fixHMR';
import { GarfishOptionsLife } from './plugins/lifecycle';
import { GarfishPreloadPlugin } from './plugins/preload';

export class Garfish implements interfaces.Garfish {
  public hooks: Hooks;
  public loader: Loader;
  public running = false;
  public version = __VERSION__;
  public flag = __GARFISH_FLAG__; // A unique identifier
  public channel = new EventEmitter();
  public options = createDefaultOptions();
  public externals: Record<string, any> = {};
  public plugins: Array<interfaces.Plugin> = [];
  public activeApps: Array<interfaces.App> = [];
  public cacheApps: Record<string, interfaces.App> = {};
  public appInfos: Record<string, interfaces.AppInfo> = {};
  private loading: Record<string, Promise<any> | null> = {};

  constructor(options: interfaces.Options) {
    this.hooks = new Hooks(false);
    this.loader = new Loader();

    // Init Garfish options
    this.setOptions(options);
    // Register plugins
    options?.plugins?.forEach((pluginCb) => {
      this.usePlugin(this.hooks, pluginCb);
    });
    this.hooks.lifecycle.initialize.call(this.options);
  }

  private injectOptionalPlugin(options?: interfaces.Options) {
    const defaultPlugin = [GarfishHMRPlugin(), GarfishOptionsLife(options)];
    // Preload plugin
    if (!options.disablePreloadApp) defaultPlugin.push(GarfishPreloadPlugin());

    defaultPlugin.forEach((pluginCb) => {
      this.usePlugin(this.hooks, pluginCb);
    });
  }

  private async mergeAppOptions(
    appName: string,
    options?: Partial<interfaces.LoadAppOptions> | string,
  ) {
    options = options || {};
    // `Garfish.loadApp('appName', 'https://xx.html');`
    if (typeof options === 'string') {
      options = {
        name: appName,
        entry: options,
        basename: '/',
      } as interfaces.AppInfo;
    }

    let appInfo = this.appInfos[appName];
    if (appInfo) {
      appInfo = mergeConfig(appInfo, options);
    } else {
      appInfo = mergeConfig(this.options, options);
      filterGlobalConfig(appInfo);
    }

    // Does not support does not have remote resources application
    assert(
      appInfo.entry,
      `Can't load unexpected child app "${appName}", ` +
        'Please provide the entry parameters or registered in advance of the app.',
    );
    appInfo.name = appName;
    // Initialize the mount point, support domGetter as promise, is advantageous for the compatibility
    if (appInfo.domGetter) {
      appInfo.domGetter = await getRenderNode(appInfo.domGetter);
    }
    return appInfo as AppInfo;
  }

  private setOptions(options: Partial<interfaces.Options>) {
    assert(!this.running, 'Garfish is running, can`t set options');
    if (isPlainObject(options)) {
      this.options = mergeConfig(this.options, options);
    }
    return this;
  }

  usePlugin(
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

  run(options?: interfaces.Options) {
    if (this.running) {
      // Nested scene can be repeated registration application
      if (options.nested) {
        const hooks = new Hooks(true);
        const mainOptions = createDefaultOptions(true);
        options = filterNestedConfig(mergeConfig(mainOptions, options));

        // Register plugins
        options.plugins?.forEach((pluginCb) => {
          this.usePlugin(hooks, pluginCb);
        });
        // Nested applications have independent life cycles
        this.usePlugin(hooks, GarfishOptionsLife(options));

        if (options.apps) {
          // usage:
          //  `Garfish.run({ apps: [{ props: Garfish.props }] })`
          this.registerApp(
            options.apps.map((app) => {
              const appConf = mergeConfig(options, app);
              filterGlobalConfig(appConf);
              appConf.hooks = hooks;
              appConf.sandbox = this.options.sandbox;
              return appConf;
            }),
          );
        }
        return this;
      } else if (__DEV__) {
        warn('Garfish is already running now, Cannot run Garfish repeatedly.');
      }
    }

    // register plugins
    options?.plugins?.forEach((pluginCb) => {
      this.usePlugin(this.hooks, pluginCb, this);
    });

    this.hooks.lifecycle.beforeBootstrap.call(this.options);
    this.setOptions(options);
    this.injectOptionalPlugin(this.options);
    // register apps
    this.registerApp(options.apps || []);
    this.running = true;
    this.hooks.lifecycle.bootstrap.call(this.options);
    return this;
  }

  registerApp(list: interfaces.AppInfo | Array<interfaces.AppInfo>) {
    this.hooks.lifecycle.beforeRegisterApp.call(list);
    const currentAdds = {};
    if (!Array.isArray(list)) list = [list];
    for (let info of list) {
      assert(info.name, 'Miss app.name.');
      if (!this.appInfos[info.name]) {
        assert(
          info.entry,
          `${info.name} application entry is not url: ${info.entry}`,
        );
        // Deep merge this.options
        if (!info.nested) {
          info = mergeConfig(this.options, info);
          filterGlobalConfig(info);
        }
        currentAdds[info.name] = info;
        this.appInfos[info.name] = info;
      } else if (__DEV__) {
        warn(`The "${info.name}" app is already registered.`);
      }
    }
    this.hooks.lifecycle.registerApp.call(currentAdds);
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
  }

  async loadApp(
    appName: string,
    options?: Partial<interfaces.LoadAppOptions> | string,
  ): Promise<interfaces.App | null> {
    assert(appName, 'Miss appName.');
    const appInfo = await this.mergeAppOptions(appName, options);

    const asyncLoadProcess = async () => {
      // Return not undefined type data directly to end loading
      const stopLoad = await this.hooks.lifecycle.beforeLoad.call(appInfo);
      if (stopLoad === false) {
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

          // Call lifecycle
          this.hooks.lifecycle.processResource.call(
            appInfo,
            manager,
            resources,
          );
          appInstance = new App(
            this,
            appInfo,
            manager,
            resources,
            isHtmlMode,
            this.options.customLoader,
          );
          this.cacheApps[appName] = appInstance;
        } catch (e) {
          __DEV__ && error(e);
          this.hooks.lifecycle.errorLoadApp.call(e, appInfo);
        } finally {
          this.loading[appName] = null;
        }
      }
      this.hooks.lifecycle.afterLoad.call(appInfo, appInstance);
      return appInstance;
    };

    if (!appInfo.cache || !this.loading[appName]) {
      this.loading[appName] = asyncLoadProcess();
    }
    return this.loading[appName];
  }
}
