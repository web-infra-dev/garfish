import { StyleManager, TemplateManager } from '@garfish/loader';
import {
  Text,
  Node,
  warn,
  assert,
  hasOwn,
  remove,
  Queue,
  coreLog,
  isJsType,
  isObject,
  isPromise,
  isGarfishConfigType,
  toBoolean,
  findTarget,
  evalWithEnv,
  transformUrl,
  __MockBody__,
  __MockHead__,
  getRenderNode,
  sourceListTags,
  createAppContainer,
  setDocCurrentScript,
  getSourceURL,
} from '@garfish/utils';
import { Garfish } from '../garfish';
import { interfaces } from '../interface';
import { appLifecycle } from '../lifecycle';
import { ESModuleLoader } from './esModule';
import { SubAppObserver } from '../plugins/performance/subAppObserver';

export type CustomerLoader = (
  provider: interfaces.Provider,
  appInfo: interfaces.AppInfo,
  path?: string,
) => Promise<interfaces.LoaderResult | void> | interfaces.LoaderResult | void;

export type AppInfo = interfaces.AppInfo & {
  appId?: number;
};

export interface ExecScriptOptions {
  node?: Node;
  async?: boolean;
  noEntry?: boolean;
  isInline?: boolean;
  isModule?: boolean;
}

let appId = 0;
const __GARFISH_GLOBAL_ENV__ = '__GARFISH_GLOBAL_ENV__';
export const __GARFISH_EXPORTS__ = '__GARFISH_EXPORTS__';

// Have the ability to App instance
// 1. Provide static resource, the structure of the HTML, CSS, js.
// 2. Can be extracted in the js CJS through scope __GARFISH_EXPORTS__ namespace or get child application provider is deduced.
// 3. Through execCode incoming environment variables such as CJS specification of the module, the require, exports to realize external sharing
// 4. Trigger rendering：Application related nodes placed in the document flow, which in turn perform application scripts, final render function,
//    perform the son application provides complete application independent runtime execution.
// 5. Trigger the destruction: Perform the destroy function of child application, and applies the child node is removed from the document flow.
export class App {
  public appId = appId++;
  public scriptCount = 0;
  public display = false;
  public mounted = false;
  public mounting = false;
  public strictIsolation = false;
  public esmQueue = new Queue();
  public esModuleLoader = new ESModuleLoader(this);
  public name: string;
  public isHtmlMode: boolean;
  public global: any = window;
  public appContainer: HTMLElement;
  public cjsModules: Record<string, any>;
  public htmlNode: HTMLElement | ShadowRoot;
  public customExports: Record<string, any> = {}; // If you don't want to use the CJS export, can use this
  public sourceList: Array<{ tagName: string; url: string | URL | Request }> =
    [];
  public sourceListMap: Map<
    string,
    { tagName: string; url: string | URL | Request }
  > = new Map();
  public appInfo: AppInfo;
  public context: Garfish;
  public hooks: interfaces.AppHooks;
  public provider?: interfaces.Provider;
  public entryManager: TemplateManager;
  public appPerformance: SubAppObserver;
  public customLoader?: CustomerLoader;
  public childGarfishConfig: interfaces.ChildGarfishConfig = {};
  public asyncProviderTimeout: number;

  // private
  private active = false;
  private unmounting = false;
  private resources: interfaces.ResourceModules;
  private globalEnvVariables: Record<string, any>;
  private deferNodeMap = new Map();
  private resolveAsyncProvider: () => void | undefined;
  private asyncProvider?:
    | interfaces.Provider
    | ((...args: any[]) => interfaces.Provider);
  // Environment variables injected by garfish for linkage with child applications

  constructor(
    context: Garfish,
    appInfo: AppInfo,
    entryManager: TemplateManager,
    resources: interfaces.ResourceModules,
    isHtmlMode: boolean,
    customLoader?: CustomerLoader,
  ) {
    this.context = context;
    this.appInfo = appInfo;
    this.name = appInfo.name;
    this.resources = resources;
    this.isHtmlMode = isHtmlMode;
    this.entryManager = entryManager;

    // `appInfo` is completely independent and can be associated with `appId`
    this.appInfo.appId = this.appId;

    // Garfish environment variables
    this.globalEnvVariables = {
      currentApp: this,
      loader: context.loader,
      externals: context.externals,
      remoteModulesCode: resources.modules,
    };
    this.cjsModules = {
      exports: {},
      module: null,
      require: (key: string) => {
        const pkg = this.global[key] || context.externals[key] || window[key];
        if (!pkg) {
          warn(`Package "${key}" is not found`);
        }
        return pkg;
      },
    };
    this.cjsModules.module = this.cjsModules;
    this.customLoader = customLoader;

    // Register hooks
    this.hooks = appLifecycle();
    this.hooks.usePlugin({
      ...appInfo,
      name: `${appInfo.name}-lifecycle`,
    });

    // Save all the resources to address
    const nodes = entryManager.getNodesByTagName(...sourceListTags);
    for (const key in nodes) {
      nodes[key].forEach((node) => {
        const url =
          entryManager.findAttributeValue(node, 'href') ||
          entryManager.findAttributeValue(node, 'src');

        if (url) {
          this.addSourceList({
            tagName: node.tagName,
            url: entryManager.url ? transformUrl(entryManager.url, url) : url,
          });
        }
        if (
          isGarfishConfigType({
            type: entryManager.findAttributeValue(node, 'type'),
          })
        ) {
          // garfish config script founded
          // parse it
          this.childGarfishConfig = JSON.parse(
            (node.children?.[0] as Text)?.content,
          );
        }
      });
    }
    this.appInfo.entry &&
      this.addSourceList({ tagName: 'html', url: this.appInfo.entry });
    this.asyncProviderTimeout = this.appInfo.asyncProviderTimeout ?? 0;
  }

  get rootElement() {
    return findTarget(this.htmlNode, [`div[${__MockBody__}]`, 'body']);
  }

  get getSourceList() {
    return this.sourceList;
  }

  addSourceList(
    sourceInfo:
      | Array<{ tagName: string; url: string | URL | Request }>
      | { tagName: string; url: string | URL | Request },
  ) {
    if (this.appInfo.disableSourceListCollect) return;
    if (Array.isArray(sourceInfo)) {
      const nSourceList = sourceInfo.filter((item) => {
        const url = getSourceURL(item.url);
        if (!this.sourceListMap.has(url) && url.startsWith('http')) {
          this.sourceListMap.set(url, item);
          return true;
        }
        return false;
      });
      this.sourceList = this.sourceList.concat(nSourceList);
    } else {
      const url = getSourceURL(sourceInfo.url);
      if (!this.sourceListMap.get(url) && url.startsWith('http')) {
        this.sourceList.push(sourceInfo);
        this.sourceListMap.set(url, sourceInfo);
      }
    }
  }

  private initAsyncProviderRegistration() {
    const { asyncProviderTimeout, customExports } = this;

    if (asyncProviderTimeout) {
      // just inject 'registerProvider' function for async provider registration
      customExports.registerProvider = (
        provider: typeof this.asyncProvider,
      ) => {
        this.asyncProvider = provider;
        // resolve it immediately
        this.resolveAsyncProvider?.();
      };
    }
  }

  awaitAsyncProviderRegistration() {
    return new Promise<typeof this.asyncProvider>((resolve) => {
      if (this.asyncProvider) {
        resolve(this.asyncProvider);
        return;
      }

      const timeoutId = setTimeout(() => {
        // timeout
        resolve(this.asyncProvider);
      }, this.asyncProviderTimeout);

      this.resolveAsyncProvider = () => {
        clearTimeout(timeoutId);
        resolve(this.asyncProvider);
      };
    });
  }

  getProvider() {
    return this.provider
      ? Promise.resolve(this.provider)
      : this.checkAndGetProvider();
  }

  isNoEntryScript(url = '') {
    return this.childGarfishConfig.sandbox?.noEntryScripts?.some(
      (item) => url.indexOf(item) > -1,
    );
  }

  execScript(
    code: string,
    env: Record<string, any>,
    url?: string,
    options?: interfaces.ExecScriptOptions,
  ) {
    env = {
      ...this.getExecScriptEnv(options?.noEntry),
      ...(env || {}),
    };

    this.scriptCount++;

    const args = [this.appInfo, code, env, url, options] as const;
    this.hooks.lifecycle.beforeEval.emit(...args);
    try {
      this.runCode(code, env, url, options);
    } catch (err) {
      this.hooks.lifecycle.errorExecCode.emit(err, ...args);
      throw err;
    }

    this.hooks.lifecycle.afterEval.emit(...args);
  }

  // `vm sandbox` can override this method
  runCode(
    code: string,
    env: Record<string, any>,
    url?: string,
    options?: interfaces.ExecScriptOptions,
  ) {
    // If the node is an es module, use native esmModule
    if (options && options.isModule) {
      this.esmQueue.add(async (next) => {
        await this.esModuleLoader.load(
          code,
          {
            // rebuild full env
            ...this.getExecScriptEnv(),
            // this 'env' may lost commonjs data
            ...env,
          },
          url,
          options,
        );
        next();
      });
    } else {
      const revertCurrentScript = setDocCurrentScript(
        this.global.document,
        code,
        true,
        url,
        options?.async,
        options?.defer,
        options?.originScript,
      );
      code += url ? `\n//# sourceURL=${url}\n` : '';
      if (!hasOwn(env, 'window')) {
        env = {
          ...env,
          window: this.global,
        };
      }
      evalWithEnv(`;${code}`, env, this.global);
      Promise.resolve().then(revertCurrentScript);
    }
  }

  async show() {
    this.active = true;
    const { display, mounted, provider } = this;
    if (display) return false;
    if (!mounted) {
      __DEV__ && warn('Need to call the "app.mount()" method first.');
      return false;
    }
    this.hooks.lifecycle.beforeMount.emit(this.appInfo, this, true);
    this.context.activeApps.push(this);

    await this.addContainer();
    this.callRender(provider, false);
    this.display = true;
    this.hooks.lifecycle.afterMount.emit(this.appInfo, this, true);
    return true;
  }

  hide() {
    this.active = false;
    this.mounting = false;
    const { display, mounted, provider } = this;
    if (!display) return false;
    if (!mounted) {
      __DEV__ && warn('Need to call the "app.mount()" method first.');
      return false;
    }
    this.hooks.lifecycle.beforeUnmount.emit(this.appInfo, this, true);

    this.callDestroy(provider, false);
    this.display = false;
    remove(this.context.activeApps, this);
    this.hooks.lifecycle.afterUnmount.emit(this.appInfo, this, true);
    return true;
  }

  async mount() {
    if (!this.canMount()) return false;
    this.hooks.lifecycle.beforeMount.emit(this.appInfo, this, false);

    this.active = true;
    this.mounting = true;
    try {
      this.context.activeApps.push(this);
      // Because the 'unmount' lifecycle will reset 'customExports'
      // so we should initialize async registration while mounting
      this.initAsyncProviderRegistration();
      // add container and compile js with cjs
      const { asyncScripts, deferScripts } =
        await this.compileAndRenderContainer();
      if (!this.stopMountAndClearEffect()) return false;

      // The defer script is still a synchronous code and needs to be placed before `getProvider`
      deferScripts();

      // Good provider is set at compile time
      const provider = await this.getProvider();
      // Existing asynchronous functions need to decide whether the application has been unloaded
      if (!this.stopMountAndClearEffect()) return false;

      this.callRender(provider, true);
      this.display = true;
      this.mounted = true;
      this.hooks.lifecycle.afterMount.emit(this.appInfo, this, false);

      // Run async scripts
      await asyncScripts;
      if (!this.stopMountAndClearEffect()) return false;
    } catch (e) {
      this.entryManager.DOMApis.removeElement(this.appContainer);
      this.hooks.lifecycle.errorMountApp.emit(e, this.appInfo);
      return false;
    } finally {
      this.mounting = false;
    }
    return true;
  }

  unmount() {
    this.active = false;
    this.mounting = false;
    if (!this.mounted || !this.appContainer) {
      return false;
    }
    if (this.unmounting) {
      __DEV__ && warn(`The ${this.name} app unmounting.`);
      return false;
    }
    // This prevents the unmount of the current app from being called in "provider.destroy"
    this.unmounting = true;
    this.hooks.lifecycle.beforeUnmount.emit(this.appInfo, this, false);

    try {
      this.callDestroy(this.provider, true);
      this.display = false;
      this.mounted = false;
      this.provider = undefined;
      this.customExports = {};
      this.cjsModules.exports = {};
      this.esModuleLoader.destroy();
      remove(this.context.activeApps, this);
      this.hooks.lifecycle.afterUnmount.emit(this.appInfo, this, false);
    } catch (e) {
      remove(this.context.activeApps, this);
      this.entryManager.DOMApis.removeElement(this.appContainer);
      this.hooks.lifecycle.errorUnmountApp.emit(e, this.appInfo);
      return false;
    } finally {
      this.unmounting = false;
    }
    return true;
  }

  getExecScriptEnv(noEntry?: boolean) {
    // The legacy of commonJS function support
    const envs = {
      [__GARFISH_EXPORTS__]: this.customExports,
      [__GARFISH_GLOBAL_ENV__]: this.globalEnvVariables,
    };

    if (noEntry) {
      return {
        ...envs,
        require: this.cjsModules.require,
      };
    }

    return {
      ...envs,
      ...this.cjsModules,
    };
  }

  // Performs js resources provided by the module, finally get the content of the export
  async compileAndRenderContainer() {
    // Render the application node
    // If you don't want to use the CJS export, at the entrance is not can not pass the module, the require
    await this.renderTemplate();

    const execScript = (type: 'async' | 'defer') => {
      for (const jsManager of this.resources.js) {
        if (jsManager[type]) {
          try {
            let noEntry = false;
            const targetUrl = jsManager.url || this.appInfo.entry;

            if (type === 'defer') {
              const node = this.deferNodeMap.get(jsManager);
              if (node) {
                noEntry = toBoolean(
                  this.entryManager.findAttributeValue(node, 'no-entry'),
                );
              }
              // Try to read the childApp global configuration
              if (!noEntry) {
                noEntry = toBoolean(this.isNoEntryScript(targetUrl));
              }
            }
            this.execScript(jsManager.scriptCode, {}, targetUrl, {
              noEntry,
              defer: type === 'defer',
              async: type === 'async',
              isModule: jsManager.isModule(),
              isInline: jsManager.isInlineScript(),
            });
          } catch (e) {
            // The defer script already handles errors in the `mount` method
            if (type !== 'defer') {
              this.hooks.lifecycle.errorMountApp.emit(e, this.appInfo);
            }
          }
        }
      }
    };

    // Execute asynchronous script and defer script
    return {
      deferScripts: () => execScript('defer'),

      asyncScripts: new Promise<void>((resolve) => {
        // Asynchronous script does not block the rendering process
        setTimeout(() => {
          if (this.stopMountAndClearEffect()) {
            execScript('async');
          }
          resolve();
        });
      }),
    };
  }

  private canMount() {
    // If you are not in mount mount
    if (this.mounting) {
      __DEV__ && warn(`The ${this.appInfo.name} app mounting.`);
      return false;
    }
    // If the application has been rendered complete, apply colours to a drawing again, need to destroy the rendering
    if (this.mounted) {
      __DEV__ && warn(`The ${this.appInfo.name} app already mounted.`);
      return false;
    }
    // Application in destruction state, the need to destroy completed to render
    if (this.unmounting) {
      __DEV__ &&
        warn(
          `The ${this.appInfo.name} app is unmounting can't Perform application rendering.`,
        );
      return false;
    }
    return true;
  }

  // If asynchronous task encountered in the rendering process, such as triggering the beforeEval before executing code,
  // after the asynchronous task, you need to determine whether the application has been destroyed or in the end state.
  // If in the end state will need to perform the side effects of removing rendering process, adding a mount point to a document,
  // for example, execute code of the environmental effects, and rendering the state in the end.
  private stopMountAndClearEffect() {
    if (!this.active) {
      if (__DEV__) {
        warn(`The app "${this.name}" rendering process has been blocked.`);
      }
      this.mounting = false;
      // Will have been added to the document flow on the container
      if (this.appContainer) {
        this.entryManager.DOMApis.removeElement(this.appContainer);
      }
      coreLog(
        `${this.appInfo.name} id:${this.appId} stopMountAndClearEffect`,
        this.appContainer,
      );
      return false;
    }
    return true;
  }

  // Calls to render do compatible with two different sandbox
  private callRender(provider?: interfaces.Provider, isMount?: boolean) {
    if (provider && provider.render) {
      provider.render({
        appName: this.appInfo.name,
        dom: this.rootElement,
        basename: this.appInfo.basename,
        appRenderInfo: { isMount },
        props: this.appInfo.props,
      });
    }
  }

  // Call to destroy do compatible with two different sandbox
  private callDestroy(provider?: interfaces.Provider, isUnmount?: boolean) {
    const { rootElement, appContainer } = this;
    if (provider && provider.destroy) {
      provider.destroy({
        appName: this.appInfo.name,
        dom: rootElement,
        appRenderInfo: { isUnmount },
        props: this.appInfo.props,
      });
    }
    this.entryManager.DOMApis.removeElement(appContainer);
  }

  // Create a container node and add in the document flow
  // domGetter Have been dealing with
  private async addContainer() {
    // Initialize the mount point, support domGetter as promise, is advantageous for the compatibility
    const wrapperNode = await getRenderNode(this.appInfo.domGetter);
    if (typeof wrapperNode.appendChild === 'function') {
      wrapperNode.appendChild(this.appContainer);
    }
  }

  private async renderTemplate() {
    const { appInfo, entryManager, resources } = this;
    const { url: baseUrl, DOMApis } = entryManager;
    const { htmlNode, appContainer } = createAppContainer(appInfo);

    // Transformation relative path
    this.htmlNode = htmlNode;
    this.appContainer = appContainer;

    // To append to the document flow, recursive again create the contents of the HTML or execute the script
    await this.addContainer();

    const customRenderer: Parameters<typeof entryManager.createElements>[0] = {
      meta: () => null,

      img: (node) => {
        baseUrl && entryManager.toResolveUrl(node, 'src', baseUrl);
        return DOMApis.createElement(node);
      },

      video: (node) => {
        baseUrl && entryManager.toResolveUrl(node, 'src', baseUrl);
        return DOMApis.createElement(node);
      },

      audio: (node) => {
        baseUrl && entryManager.toResolveUrl(node, 'src', baseUrl);
        return DOMApis.createElement(node);
      },

      iframe: (node) => {
        baseUrl && entryManager.toResolveUrl(node, 'src', baseUrl);
        return DOMApis.createElement(node);
      },

      // The body and head this kind of treatment is to compatible with the old version
      body: (node) => {
        if (!this.strictIsolation) {
          node = entryManager.cloneNode(node);
          node.tagName = 'div';
          node.attributes.push({
            key: __MockBody__,
            value: null,
          });
        }
        return DOMApis.createElement(node);
      },

      head: (node) => {
        if (!this.strictIsolation) {
          node = entryManager.cloneNode(node);
          node.tagName = 'div';
          node.attributes.push({
            key: __MockHead__,
            value: null,
          });
        }
        return DOMApis.createElement(node);
      },

      script: (node) => {
        const mimeType = entryManager.findAttributeValue(node, 'type');
        const isModule = mimeType === 'module';

        if (mimeType) {
          // Other script template
          if (!isModule && !isJsType({ type: mimeType })) {
            return DOMApis.createElement(node);
          }
        }
        const jsManager = resources.js.find((manager) => {
          return !manager.async ? manager.isSameOrigin(node) : false;
        });

        if (jsManager) {
          if (jsManager.defer) {
            this.deferNodeMap.set(jsManager, node);
          } else {
            const { url, scriptCode } = jsManager;
            const mockOriginScript = document.createElement('script');
            node.attributes.forEach((attribute) => {
              if (attribute.key) {
                mockOriginScript.setAttribute(
                  attribute.key,
                  attribute.value || '',
                );
              }
            });

            const targetUrl = url || this.appInfo.entry;
            this.execScript(scriptCode, {}, targetUrl, {
              isModule,
              async: false,
              defer: false,
              isInline: jsManager.isInlineScript(),
              noEntry: toBoolean(
                entryManager.findAttributeValue(node, 'no-entry') ||
                  this.isNoEntryScript(targetUrl),
              ),
              originScript: mockOriginScript,
            });
          }
        } else if (__DEV__) {
          const async = entryManager.findAttributeValue(node, 'async');
          if (typeof async === 'undefined' || async === 'false') {
            const tipInfo = JSON.stringify(node, null, 2);
            warn(
              `Current js node cannot be found, the resource may not exist.\n\n ${tipInfo}`,
            );
          }
        }
        return DOMApis.createScriptCommentNode(node);
      },

      style: (node) => {
        const text = node.children[0] as Text;
        if (text) {
          const styleManager = new StyleManager(text.content, baseUrl);
          styleManager.setScope({
            appName: this.name,
            rootElId: this.appContainer.id,
          });
          baseUrl && styleManager.correctPath(baseUrl);
          return entryManager.ignoreChildNodesCreation(
            styleManager.renderAsStyleElement(),
          );
        }
        return DOMApis.createElement(node);
      },

      link: (node) => {
        if (DOMApis.isCssLinkNode(node)) {
          const styleManager = this.resources.link.find((manager) =>
            manager.isSameOrigin(node),
          );
          if (styleManager) {
            styleManager.setScope({
              appName: this.name,
              rootElId: this.appContainer.id,
            });
            return styleManager.renderAsStyleElement(
              __DEV__ ? `\n/*${DOMApis.createLinkCommentNode(node)}*/\n` : '',
            );
          }
        }
        // prettier-ignore
        return DOMApis.isPrefetchJsLinkNode(node)
          ? DOMApis.createScriptCommentNode(node)
          : DOMApis.isIconLinkNode(node)
            ? null // Filter the icon of the child app, and cannot affect the main application
            : DOMApis.createElement(node);
      },
    };

    // Render dom tree and append to document
    entryManager.createElements(customRenderer, htmlNode, (node, parent) => {
      // Trigger a custom render hook
      return this.hooks.lifecycle.customRender.emit({
        node,
        parent,
        app: this,
        customElement: null,
      });
    });
  }

  private async checkAndGetProvider() {
    const { appInfo, rootElement, cjsModules, customExports } = this;
    const { name, props, basename } = appInfo;
    let provider:
      | ((...args: any[]) => interfaces.Provider)
      | interfaces.Provider
      | undefined = undefined;

    // esModule export
    await this.esmQueue.awaitCompletion();

    // Cjs exports
    if (cjsModules.exports) {
      if (isPromise(cjsModules.exports))
        cjsModules.exports = await cjsModules.exports;
      // Is not set in the configuration of webpack library option
      if (cjsModules.exports.provider) provider = cjsModules.exports.provider;
    }

    // Custom export prior to export by default
    if (customExports.provider) {
      provider = customExports.provider;
    }

    // async provider
    if (this.asyncProviderTimeout && !provider) {
      // this child app needs async provider registration
      provider = await this.awaitAsyncProviderRegistration();
    }

    if (typeof provider === 'function') {
      provider = await provider(
        {
          basename,
          dom: rootElement,
          ...(props || {}),
        },
        props,
      );
    } else if (isPromise(provider)) {
      provider = await provider;
    }

    // The provider may be a function object
    if (!isObject(provider) && typeof provider !== 'function') {
      warn(
        ` Invalid module content: ${name}, you should return both render and destroy functions in provider function.`,
      );
    }

    // If you have customLoader, the dojo.provide by user
    const hookRes = await (this.customLoader &&
      this.customLoader(provider as interfaces.Provider, appInfo, basename));

    if (hookRes) {
      const { mount, unmount } = hookRes || ({} as any);
      if (typeof mount === 'function' && typeof unmount === 'function') {
        (provider as interfaces.Provider).render = mount;
        (provider as interfaces.Provider).destroy = unmount;
      }
    }

    if (!appInfo.noCheckProvider) {
      assert(provider, `"provider" is "${provider}".`);
      // No need to use "hasOwn", because "render" may be on the prototype chain
      assert('render' in provider, '"render" is required in provider.');
      assert('destroy' in provider, '"destroy" is required in provider.');
    }

    this.provider = provider as interfaces.Provider;
    return provider as interfaces.Provider;
  }
}
