import { EventEmitter } from 'events';
import { Loader } from '@garfish/loader';
import {
  warn,
  error,
  assert,
  hasOwn,
  isObject,
  findProp,
  deepMerge,
  transformUrl,
  __GARFISH_FLAG__,
  StyleManager,
  TemplateManager,
  JavaScriptManager,
} from '@garfish/utils';
import { Hooks } from './hooks';
import { App } from './module/app';
import { interfaces } from './interface';
import { Component } from './module/component';
import { GarfishHMRPlugin } from './plugins/fixHMR';
import { GarfishOptionsLife } from './plugins/lifecycle';
import { GarfishPreloadPlugin } from './plugins/preload';
import { getDefaultOptions, defaultLoadComponentOptions } from './config';

type Manager = StyleManager | TemplateManager | JavaScriptManager;

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
    this.hooks = new Hooks();
    this.loader = new Loader();
    // init Garfish options
    this.setOptions(options);
    // register plugins
    options?.plugins.forEach((pluginCb) => {
      this.usePlugin(pluginCb, this);
    });
    this.hooks.lifecycle.initialize.call(this.options);
  }

  private injectOptionalPlugin(options?: interfaces.Options) {
    const defaultPlugin = [GarfishHMRPlugin(), GarfishOptionsLife()];
    if (!options.disablePreloadApp) {
      defaultPlugin.push(GarfishPreloadPlugin());
    }
    defaultPlugin.forEach((pluginCb) => {
      this.usePlugin(pluginCb, this);
    });
  }

  public usePlugin(
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
    return this.hooks.usePlugins(res);
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
      __DEV__ &&
        warn('Garfish is already running now, Cannot run Garfish repeatedly.');
      // Nested scene can be repeated registration application, and basic information for the basename
      this.registerApp(
        options.apps?.map((app) => {
          return {
            ...app,
            basename: options?.basename || this.options.basename,
            domGetter: options?.domGetter || this.options.domGetter,
          };
        }),
      );
      return this;
    }
    this.hooks.lifecycle.beforeBootstrap.call(this.options);
    this.setOptions(options);
    // register plugins
    options?.plugins?.forEach((pluginCb) => {
      this.usePlugin(pluginCb, this);
    });
    this.injectOptionalPlugin(options);
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
    name: string,
    opts: interfaces.LoadAppOptions,
  ): Promise<interfaces.App> {
    let appInfo = this.appInfos[name];
    // Does not support does not have remote resources and no registered application
    assert(
      !(!appInfo && !opts.entry),
      `Can't load unexpected module "${name}".` +
        'Please provide the entry parameters or registered in advance of the app',
    );
    // Pretreatment parameters, and the default cache
    if (!appInfo) {
      appInfo = { name, cache: true, ...opts };
    } else {
      appInfo = {
        cache: true,
        ...appInfo,
        ...opts,
      };
    }

    const asyncLoadProcess = async () => {
      // Return not undefined type data directly to end loading
      const stopLoad = await this.hooks.lifecycle.beforeLoad.promise(appInfo);
      if (stopLoad === false) {
        warn(`Load ${name} application is terminated by beforeLoad`);
        return null;
      }

      // Existing cache caching logic
      let result = null;
      const cacheApp = this.cacheApps[name];
      if (opts.cache && cacheApp) {
        result = cacheApp;
      } else {
        try {
          this.loader.lifecycle.loaded.addOnce((data) => {
            const { result, code, fileType, isComponent } = data;
            if (isComponent) {
              // deal with component result
            } else {
              // prettier-ignore
              const managerCtor =
                fileType === 'template'
                  ? TemplateManager
                  : fileType === 'css'
                    ? StyleManager
                    : fileType === 'js'
                      ? JavaScriptManager
                      : null;
              return managerCtor ? new managerCtor(code, result.url) : null;
            }
            return null;
          });

          const manager = await this.loader.load<Manager>(
            appInfo.name,
            transformUrl(location.href, appInfo.entry),
          );

          if (manager instanceof TemplateManager) {
            const jsNodes = manager.findAllJsNodes();
            const linkNodes = manager.findAllLinkNodes();
            jsNodes.map((node) => {
              const src = (manager as TemplateManager).findAttributeValue(
                node,
                'src',
              );
            });
          } else if (manager instanceof JavaScriptManager) {
          } else {
            error(
              `The resource returned by the entry of "${appInfo.name}" app cannot be css.`,
            );
          }

          // this.hooks.lifecycle.processResource.call(
          //   appInfo,
          //   manager,
          //   resources,
          // );

          // result = new App(
          //   this,
          //   appInfo,
          //   manager,
          //   resources,
          //   isHtmlMode,
          //   this.options.customLoader,
          // );
          this.cacheApps[name] = result;
        } catch (e) {
          __DEV__ && error(e);
          this.hooks.lifecycle.errorLoadApp.call(appInfo, e);
        } finally {
          this.loading[name] = null;
        }
      }
      this.hooks.lifecycle.afterLoad.call(appInfo, result);
      return result;
    };

    if (!opts.cache || !this.loading[name]) {
      this.loading[name] = asyncLoadProcess();
    }
    return this.loading[name];
  }

  async loadComponent(
    name: string,
    options: interfaces.LoadComponentOptions,
  ): Promise<interfaces.Component> {
    const opts: interfaces.LoadComponentOptions = {
      ...defaultLoadComponentOptions,
      ...options,
    };
    const nameWithVersion = opts?.version ? `${name}@${opts?.version}` : name;
    const asyncLoadProcess = async () => {
      // Existing cache caching logic
      let result = null;
      const cacheComponents = this.cacheComponents[nameWithVersion];
      if (opts.cache && cacheComponents) {
        result = cacheComponents;
      } else {
        const manager = (await this.loader.load(
          opts?.url,
        )) as interfaces.JsResource;
        try {
          result = new Component(this, { name, ...opts }, manager);
          this.cacheComponents[nameWithVersion] = result;
        } catch (e) {
          __DEV__ && error(e);
        } finally {
          this.loading[nameWithVersion] = null;
        }
      }
      return result;
    };

    if (!opts.cache || !this.loading[nameWithVersion]) {
      this.loading[nameWithVersion] = asyncLoadProcess();
    }
    return this.loading[nameWithVersion];
  }
}
