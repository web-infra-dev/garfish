import { StyleManager, TemplateManager } from '@garfish/loader';
import {
  Text,
  warn,
  assert,
  hasOwn,
  remove,
  isJs,
  isObject,
  isPromise,
  toBoolean,
  findTarget,
  evalWithEnv,
  transformUrl,
  __MockBody__,
  __MockHead__,
  getRenderNode,
  sourceListTags,
  parseContentType,
  createAppContainer,
  setDocCurrentScript,
} from '@garfish/utils';
import { Garfish } from '../garfish';
import { interfaces } from '../interface';
import { appLifecycle } from '../lifecycle';
import { SubAppObserver } from '../plugins/performance/subAppObserver';

/** @deprecated */
export type CustomerLoader = (
  provider: interfaces.Provider,
  appInfo: interfaces.AppInfo,
  path: string,
) => Promise<interfaces.LoaderResult | void> | interfaces.LoaderResult | void;

export type AppInfo = interfaces.AppInfo & {
  appId?: number;
};

let appId = 0;
export const __GARFISH_EXPORTS__ = '__GARFISH_EXPORTS__';
const __GARFISH_GLOBAL_ENV__ = '__GARFISH_GLOBAL_ENV__';

// Have the ability to App instance
// 1. Provide static resource, the structure of the HTML, CSS, js.
// 2. Can be extracted in the js CJS through scope __GARFISH_EXPORTS__ namespace or get child application provider is deduced.
// 3. Through execCode incoming environment variables such as CJS specification of the module, the require, exports to realize external sharing
// 4. Trigger rendering：Application related nodes placed in the document flow, which in turn perform application scripts, final render function,
//    perform the son application provides complete application independent runtime execution.
// 5. Trigger the destruction: Perform the destroy function of child application, and applies the child node is removed from the document flow.
export class App {
  public appId = appId++;
  public display = false;
  public mounted = false;
  public esModule = false;
  public strictIsolation = false;
  public name: string;
  public isHtmlMode: boolean;
  public global: any = window;
  public appContainer: HTMLElement;
  public cjsModules: Record<string, any>;
  public htmlNode: HTMLElement | ShadowRoot;
  public customExports: Record<string, any> = {}; // If you don't want to use the CJS export, can use this
  public sourceList: Array<{ tagName: string; url: string }> = [];
  public appInfo: AppInfo;
  public hooks: interfaces.AppHooks;
  public provider: interfaces.Provider;
  public entryManager: TemplateManager;
  public appPerformance: SubAppObserver;
  /** @deprecated */
  public customLoader: CustomerLoader;

  private active = false;
  private mounting = false;
  private unmounting = false;
  private context: Garfish;
  private resources: interfaces.ResourceModules;
  // Environment variables injected by garfish for linkage with child applications
  private globalEnvVariables: Record<string, any>;

  constructor(
    context: Garfish,
    appInfo: AppInfo,
    entryManager: TemplateManager,
    resources: interfaces.ResourceModules,
    isHtmlMode: boolean,
    customLoader: CustomerLoader,
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
        return this.global[key] || context.externals[key] || window[key];
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
          this.sourceList.push({
            tagName: node.tagName,
            url: transformUrl(entryManager.url, url),
          });
        }
      });
    }
    this.sourceList.push({ tagName: 'html', url: this.appInfo.entry });
  }

  get rootElement() {
    return findTarget(this.htmlNode, [`div[${__MockBody__}]`, 'body']);
  }

  getProvider() {
    return this.provider
      ? Promise.resolve(this.provider)
      : this.checkAndGetProvider();
  }

  execScript(
    code: string,
    env: Record<string, any>,
    url?: string,
    options?: { async?: boolean; noEntry?: boolean },
  ) {
    env = {
      ...this.getExecScriptEnv(options?.noEntry),
      ...(env || {}),
    };

    const args = [this.appInfo, code, env, url, options] as const;

    this.hooks.lifecycle.beforeEval.emit(...args);
    try {
      this.runCode(code, env, url, options);
    } catch (e) {
      this.hooks.lifecycle.errorExecCode.emit(e, ...args);
      throw e;
    }
    this.hooks.lifecycle.afterEval.emit(...args);
  }

  // `vm sandbox` can override this method
  runCode(
    code: string,
    env: Record<string, any>,
    url?: string,
    options?: { async?: boolean; noEntry?: boolean },
  ) {
    const revertCurrentScript = setDocCurrentScript(
      this.global.document,
      code,
      true,
      url,
      options?.async,
    );
    code += url ? `\n//# sourceURL=${url}\n` : '';

    if (!hasOwn(env, 'window')) {
      env = {
        ...env,
        window: this.global,
      };
    }

    evalWithEnv(`;${code}`, env, this.global);
    revertCurrentScript();
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

    await this.addContainer();
    this.callRender(provider, false);
    this.display = true;
    this.context.activeApps.push(this);
    this.hooks.lifecycle.afterMount.emit(this.appInfo, this, true);
    return true;
  }

  hide() {
    this.active = false;
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
      // add container and compile js with cjs
      const asyncJsProcess = await this.compileAndRenderContainer();

      // Good provider is set at compile time
      const provider = await this.getProvider();
      // Existing asynchronous functions need to decide whether the application has been unloaded
      if (!this.stopMountAndClearEffect()) return false;

      this.callRender(provider, true);
      this.display = true;
      this.mounted = true;
      this.context.activeApps.push(this);
      this.hooks.lifecycle.afterMount.emit(this.appInfo, this, false);

      await asyncJsProcess;
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
      this.provider = null;
      this.customExports = {};
      this.cjsModules.exports = {};
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

  getExecScriptEnv(noEntry: boolean) {
    // The legacy of commonJS function support
    if (this.esModule) return {};
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

    // Execute asynchronous script
    return new Promise<void>((resolve) => {
      // Asynchronous script does not block the rendering process
      setTimeout(() => {
        if (this.stopMountAndClearEffect()) {
          for (const jsManager of this.resources.js) {
            if (jsManager.async) {
              try {
                this.execScript(
                  jsManager.scriptCode,
                  {},
                  jsManager.url || this.appInfo.entry,
                  {
                    async: false,
                    noEntry: true,
                  },
                );
              } catch (e) {
                this.hooks.lifecycle.errorMountApp.emit(e, this.appInfo);
              }
            }
          }
        }
        resolve();
      });
    });
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
      return false;
    }
    return true;
  }

  // Calls to render do compatible with two different sandbox
  private callRender(provider: interfaces.Provider, isMount: boolean) {
    if (provider && provider.render) {
      provider.render(
        {
          appName: this.appInfo.name,
          dom: this.rootElement,
          basename: this.appInfo.basename,
          appRenderInfo: { isMount },
        },
        this.appInfo.props,
      );
    }
  }

  // Call to destroy do compatible with two different sandbox
  private callDestroy(provider: interfaces.Provider, isUnmount: boolean) {
    const { rootElement, appContainer } = this;
    if (provider && provider.destroy) {
      provider.destroy(
        {
          appName: this.appInfo.name,
          dom: rootElement,
          appRenderInfo: { isUnmount },
        },
        this.appInfo.props,
      );
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
        entryManager.toResolveUrl(node, 'src', baseUrl);
        return DOMApis.createElement(node);
      },

      video: (node) => {
        entryManager.toResolveUrl(node, 'src', baseUrl);
        return DOMApis.createElement(node);
      },

      audio: (node) => {
        entryManager.toResolveUrl(node, 'src', baseUrl);
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
        if (mimeType) {
          if (!isJs(parseContentType(mimeType))) {
            return DOMApis.createElement(node);
          }
        }
        const jsManager = resources.js.find((manager) => {
          return !manager.async ? manager.isSameOrigin(node) : false;
        });

        if (jsManager) {
          if (jsManager.isModule()) {
            // EsModule cannot use eval and new Function to execute the code
            warn(
              'Garfish does not support "esmodule" at the moment,' +
                'if you use "vite", please switch to other build tools.',
            );
            return DOMApis.createElement(node);
          }
          const { url, scriptCode } = jsManager;
          this.execScript(scriptCode, {}, url || this.appInfo.entry, {
            async: false,
            noEntry: toBoolean(
              entryManager.findAttributeValue(node, 'no-entry'),
            ),
          });
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
          const styleManager = new StyleManager(text.content);
          styleManager.correctPath(baseUrl);
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

    // Render dom tree and append to document.
    entryManager.createElements(customRenderer, htmlNode);
  }

  private async checkAndGetProvider() {
    const { appInfo, rootElement, cjsModules, customExports } = this;
    const { props, basename } = appInfo;
    let provider:
      | ((...args: any[]) => interfaces.Provider)
      | interfaces.Provider = null;

    // cjs exports
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

    // The provider for the function, standard export content
    if (typeof provider === 'function') {
      provider = await provider({
        basename,
        dom: rootElement,
        ...(props || {}),
        ...(appInfo.props || {}),
      });
    } else if (isPromise(provider)) {
      provider = await provider;
    }

    // The provider may be a function object
    if (!isObject(provider) && typeof provider !== 'function') {
      warn(
        ` Invalid module content: ${appInfo.name}, you should return both render and destroy functions in provider function.`,
      );
    }

    // If you have customLoader, the dojo.provide by user
    const hookRes = await (this.customLoader &&
      this.customLoader(provider, appInfo, basename));

    if (hookRes) {
      const { mount, unmount } = hookRes || ({} as any);
      if (typeof mount === 'function' && typeof unmount === 'function') {
        mount._custom = true;
        unmount._custom = true;
        provider.render = mount;
        provider.destroy = unmount;
      }
    }

    if (!appInfo.noCheckProvider) {
      assert(provider, `"provider" is "${provider}".`);
      // No need to use "hasOwn", because "render" may be on the prototype chain
      assert('render' in provider, '"render" is required in provider.');
      assert('destroy' in provider, '"destroy" is required in provider.');
    }

    this.provider = provider;
    return provider;
  }
}
