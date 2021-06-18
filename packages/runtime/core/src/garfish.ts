import { EventEmitter } from 'events';
import {
  Loader,
  Text,
  StyleManager,
  TemplateManager,
  JavaScriptManager,
  ComponentManager,
} from '@garfish/loader';
import {
  warn,
  error,
  assert,
  hasOwn,
  isObject,
  deepMerge,
  transformUrl,
  __GARFISH_FLAG__,
} from '@garfish/utils';
import { Hooks } from './hooks';
import { App } from './module/app';
import { Component } from './module/component';
import { interfaces } from './interface';
import { GarfishHMRPlugin } from './plugins/fixHMR';
import { GarfishOptionsLife } from './plugins/lifecycle';
import { GarfishPreloadPlugin } from './plugins/preload';
import { defaultLoadComponentOptions, getDefaultOptions } from './config';

type GarfishPlugin = (context: Garfish) => interfaces.Plugin;

// Fetch script and link elements
const fetchStaticResources = (
  appName: string,
  loader: Loader,
  entryManager: TemplateManager,
) => {
  // Get all script elements
  const jsNodes = Promise.all(
    entryManager
      .findAllJsNodes()
      .map((node) => {
        const src = entryManager.findAttributeValue(node, 'src');
        const type = entryManager.findAttributeValue(node, 'type');

        // There should be no embedded script in the script element tag with the src attribute specified
        if (src) {
          const fetchUrl = transformUrl(entryManager.url, src);
          const async = entryManager.findAttributeValue(node, 'async');
          // Scripts with "async" attribute will make the rendering process very complicated,
          // we have a preload mechanism, so we don’t need to deal with it.
          return loader
            .load<JavaScriptManager>(appName, fetchUrl)
            .then(({ resourceManager: jsManager }) => {
              jsManager.setDep(node);
              jsManager.setMimeType(type);
              jsManager.setAsyncAttribute(Boolean(async));
              return jsManager;
            });
        } else if (node.children.length > 0) {
          const code = (node.children[0] as Text).content;
          if (code) {
            const jsManager = new JavaScriptManager(code, '');
            jsManager.setDep(node);
            jsManager.setMimeType(type);
            return jsManager;
          }
        }
      })
      .filter(Boolean),
  );

  // Get all link elements
  const linkNodes = Promise.all(
    entryManager
      .findAllLinkNodes()
      .map((node) => {
        if (!entryManager.DOMApis.isCssLinkNode(node)) return;
        const href = entryManager.findAttributeValue(node, 'href');
        if (href) {
          const fetchUrl = transformUrl(entryManager.url, href);
          return loader
            .load<StyleManager>(appName, fetchUrl)
            .then(({ resourceManager: styleManager }) => {
              styleManager.setDep(node);
              // styleManager.setScope(appName);
              styleManager.correctPath();
              return styleManager;
            });
        }
      })
      .filter(Boolean),
  );

  return Promise.all([jsNodes, linkNodes]);
};

export class Garfish implements interfaces.Garfish {
  public hooks: Hooks;
  public loader: Loader;
  public running = false;
  public version = __VERSION__;
  public flag = __GARFISH_FLAG__; // A unique identifier
  public channel = new EventEmitter();
  public options = getDefaultOptions();
  public externals: Record<string, any> = {};
  public plugins: Array<interfaces.Plugin> = [];
  public cacheApps: Record<string, interfaces.App> = {};
  public activeApps: Record<string, interfaces.App> = {};
  public appInfos: Record<string, interfaces.AppInfo> = {};
  public cacheComponents: Record<string, interfaces.Component> = {};
  private loading: Record<string, Promise<any> | null> = {};

  constructor(options: interfaces.Options) {
    this.hooks = new Hooks(false);
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

  setOptions(options: Partial<interfaces.Options>) {
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

  run(options?: interfaces.Options) {
    if (this.running) {
      // Nested scene can be repeated registration application, and basic information for the basename、domGetter、lifeCycle
      if (options.nested) {
        const hooks = new Hooks(true);
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

    this.injectOptionalPlugin(options);

    // register plugins
    options?.plugins?.forEach((pluginCb) => {
      this.usePlugin(this.hooks, pluginCb, this);
    });

    this.hooks.lifecycle.beforeBootstrap.call(this.options);

    this.setOptions(options);

    this.running = true;
    this.hooks.lifecycle.bootstrap.call(this.options);
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
  }

  registerApp(list: interfaces.AppInfo | Array<interfaces.AppInfo>) {
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

  async loadApp(
    appName: string,
    options: interfaces.LoadAppOptions | string,
  ): Promise<interfaces.App | null> {
    let appInfo = this.appInfos[appName];
    // Does not support does not have remote resources and no registered application
    assert(
      !(!appInfo && !appInfo.entry),
      `Can't load unexpected module "${appName}".` +
        'Please provide the entry parameters or registered in advance of the app',
    );

    // Deep clone app options
    if (isObject(options)) {
      const tempInfo = appInfo;
      appInfo = deepMerge(tempInfo, options);
    } else if (typeof options === 'string') {
      // Garfish.loadApp('appName', 'https://xxx.html');
      appInfo = {
        name: appName,
        entry: options,
        domGetter: () => document.createElement('div'),
      };
    }

    const asyncLoadProcess = async () => {
      // Return not undefined type data directly to end loading
      const stopLoad = await this.hooks.lifecycle.beforeLoad.promise(appInfo);
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
          const resources = { js: [], link: [] }; // Default resources
          const { resourceManager: entryManager } = await this.loader.load(
            appName,
            transformUrl(location.href, appInfo.entry),
          );

          // Html entry
          if (entryManager instanceof TemplateManager) {
            isHtmlMode = true;
            const [js, link] = await fetchStaticResources(
              appName,
              this.loader,
              entryManager,
            );
            resources.js = js;
            resources.link = link;
          } else if (entryManager instanceof JavaScriptManager) {
            // Js entry
            isHtmlMode = false;
            const mockTemplateCode = `<script src="${entryManager.url}"></script>`;
            fakeEntryManager = new TemplateManager(
              mockTemplateCode,
              entryManager.url,
            );
            resources.js = [entryManager];
          } else {
            // No other types of entrances are currently supported
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
          this.hooks.lifecycle.errorLoadApp.call(appInfo, e);
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

  async loadComponent(
    name: string,
    options: interfaces.LoadComponentOptions,
  ): Promise<interfaces.Component> {
    options = deepMerge(defaultLoadComponentOptions, options || ({} as any));
    const nameWithVersion = options?.version
      ? `${name}@${options.version}`
      : name;
    const asyncLoadProcess = async () => {
      // Existing cache caching logic
      let result = null;
      const cacheComponents = this.cacheComponents[nameWithVersion];
      if (options.cache && cacheComponents) {
        result = cacheComponents;
      } else {
        assert(
          options.url,
          `Missing url for loading "${name}" micro component`,
        );

        const { resourceManager: manager } = await this.loader.loadComponent<
          ComponentManager
        >(name, options.url);

        try {
          result = new Component(this, { name, ...options }, manager);
          this.cacheComponents[nameWithVersion] = result;
        } catch (e) {
          __DEV__ && error(e);
        } finally {
          this.loading[nameWithVersion] = null;
        }
      }
      return result;
    };

    if (!options.cache || !this.loading[nameWithVersion]) {
      this.loading[nameWithVersion] = asyncLoadProcess();
    }
    return this.loading[nameWithVersion];
  }
}
