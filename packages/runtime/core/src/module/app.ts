import { Text, DOMApis, StyleManager, TemplateManager } from '@garfish/loader';
import {
  warn,
  assert,
  isJs,
  isObject,
  isPromise,
  findTarget,
  evalWithEnv,
  transformUrl,
  getRenderNode,
  sourceListTags,
  parseContentType,
  createAppContainer,
  setDocCurrentScript,
} from '@garfish/utils';
import { Garfish } from '../garfish';
import { interfaces } from '../interface';

export type CustomerLoader = (
  provider: interfaces.Provider,
  appInfo: interfaces.AppInfo,
  path: string,
) => Promise<interfaces.LoaderResult | void> | interfaces.LoaderResult | void;

const __GARFISH_EXPORTS__ = '__GARFISH_EXPORTS__';

export interface Provider {
  destroy: ({ dom: HTMLElement }) => void;
  render: ({ dom: HTMLElement, basename: string }) => void;
}

/**
 * Have the ability to App instance
 * 1. Provide static resource, the structure of the HTML, CSS, js.
 * 2. Can be extracted in the js CJS through scope __GARFISH_EXPORTS__ namespace or get child application provider is deduced.
 * 3. Through execCode incoming environment variables such as CJS specification of the module, the require, exports to realize external sharing
 * 4. Trigger rendering：Application related nodes placed in the document flow, which in turn perform application scripts, final render function,
 *    perform the son application provides complete application independent runtime execution.
 * 5. Trigger the destruction: Perform the destroy function of child application, and applies the child node is removed from the document flow.
 */
export class App {
  public display = false;
  public mounted = false;
  public esModule = false;
  public strictIsolation = false;
  public name: string;
  public global: any = window;
  public isHtmlMode: boolean;
  public appContainer: HTMLElement;
  public sourceList: Array<string> = [];
  public cjsModules: Record<string, any>;
  public htmlNode: HTMLElement | ShadowRoot;
  public customExports: Record<string, any> = {}; // If you don't want to use the CJS export, can use this
  public provider: Provider;
  public appInfo: interfaces.AppInfo;
  public entryManager: TemplateManager;
  public customLoader: CustomerLoader;

  private active = false;
  private mounting = false;
  private unmounting = false;
  private context: Garfish;
  private resources: interfaces.ResourceModules;

  constructor(
    context: Garfish,
    appInfo: interfaces.AppInfo,
    entryManager: TemplateManager,
    resources: interfaces.ResourceModules,
    isHtmlMode: boolean,
    customLoader: CustomerLoader,
  ) {
    this.context = context;
    // Get app container dom
    appInfo.domGetter = getRenderNode(appInfo.domGetter);

    this.appInfo = appInfo;
    this.name = appInfo.name;

    this.resources = resources;
    this.entryManager = entryManager;
    this.isHtmlMode = isHtmlMode;
    this.cjsModules = {
      exports: {},
      module: this.cjsModules,
      require: (key: string) => context.externals[key],
      [__GARFISH_EXPORTS__]: this.customExports,
    };
    this.customLoader = customLoader;

    const nodes = entryManager.getNodesByTagName(...sourceListTags);
    for (const key in nodes) {
      nodes[key].forEach((node) => {
        const url =
          entryManager.findAttributeValue(node, 'href') ||
          entryManager.findAttributeValue(node, 'src');
        if (url) {
          this.sourceList.push(transformUrl(entryManager.url, url));
        }
      });
    }
  }

  get rootElement() {
    return findTarget(this.htmlNode, ['body', 'div[__GarfishMockBody__]']);
  }

  execScript(
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
      options.async,
    );
    env = this.getExecScriptEnv(options?.noEntry) || {};

    this.context.hooks.lifecycle.beforeEval.call(
      this.appInfo,
      code,
      env,
      url,
      options,
    );
    const sourceUrl = url ? `//# sourceURL=${url}\n` : '';

    try {
      evalWithEnv(`;${code}\n${sourceUrl}`, env);
    } catch (e) {
      this.context.hooks.lifecycle.errorExecCode.call(this.appInfo, e);
      throw e;
    }
    revertCurrentScript();

    this.context.hooks.lifecycle.afterEval.call(
      this.appInfo,
      code,
      env,
      url,
      options,
    );
  }

  getExecScriptEnv(noEntry: boolean) {
    // The legacy of commonJS function support
    if (this.esModule) return {};
    if (noEntry) return { [__GARFISH_EXPORTS__]: this.customExports };
    return this.cjsModules;
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

  show() {
    this.active = true;
    const { display, mounted, provider } = this;
    if (display) return false;
    if (!mounted) {
      __DEV__ && warn('Need to call the "app.mount()" method first.');
      return false;
    }

    this.addContainer();
    this.callRender(provider);
    this.display = true;
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

    this.callDestroy(provider);
    this.display = false;
    return true;
  }

  async mount() {
    if (!this.canMount()) return;
    this.context.hooks.lifecycle.beforeMount.call(this.appInfo, this);

    this.active = true;
    this.mounting = true;
    try {
      // add container and compile js with cjs
      this.compileAndRenderContainer();

      // Good provider is set at compile time
      const provider = await this.checkAndGetProvider();

      // Existing asynchronous functions need to decide whether the application has been unloaded
      if (!this.stopMountAndClearEffect()) return false;
      this.callRender(provider);
      this.display = true;
      this.mounted = true;
      this.context.hooks.lifecycle.afterMount.call(this.appInfo, this);
    } catch (err) {
      DOMApis.removeElement(this.appContainer);
      this.context.hooks.lifecycle.errorMount.call(this.appInfo, err);
      throw err;
    } finally {
      this.mounting = false;
    }
  }

  unmount() {
    this.active = false;
    if (this.unmounting) {
      __DEV__ && warn(`The ${this.name} app unmounting.`);
      return false;
    }
    this.context.hooks.lifecycle.beforeUnMount.call(this.appInfo, this);

    this.callDestroy(this.provider);
    this.display = false;
    this.unmounting = false;
    this.mounted = false;

    this.context.hooks.lifecycle.afterUnMount.call(this.appInfo, this);
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
        DOMApis.removeElement(this.appContainer);
      }
      return false;
    }
    return true;
  }

  // Performs js resources provided by the module, finally get the content of the export
  public compileAndRenderContainer() {
    // Render the application node
    // If you don't want to use the CJS export, at the entrance is not can not pass the module, the require
    this.renderTemplate();

    // Execute asynchronous script
    for (const jsManager of this.resources.js) {
      if (jsManager.async) {
        // Asynchronous script does not block the rendering process
        try {
          this.execScript(jsManager.scriptCode, {}, jsManager.url, {
            async: false,
            noEntry: true,
          });
        } catch (err) {
          console.error(err);
        }
      }
    }
  }

  // Calls to render do compatible with two different sandbox
  private callRender(provider: interfaces.Provider) {
    const { appInfo, rootElement } = this;
    provider.render({
      dom: rootElement,
      basename: appInfo.basename,
    });
  }

  // Call to destroy do compatible with two different sandbox
  private callDestroy(provider: interfaces.Provider) {
    const { rootElement, appContainer } = this;
    provider.destroy({ dom: rootElement });
    DOMApis.removeElement(appContainer);
  }

  // Create a container node and add in the document flow
  // domGetter Have been dealing with
  private addContainer() {
    if (typeof (this.appInfo.domGetter as Element).appendChild === 'function') {
      (this.appInfo.domGetter as Element).appendChild(this.appContainer);
    }
  }

  private renderTemplate() {
    const { appInfo, entryManager, resources } = this;
    const { url: baseUrl } = entryManager;
    const { htmlNode, appContainer } = createAppContainer(appInfo.name);

    // Transformation relative path
    this.htmlNode = htmlNode;
    this.appContainer = appContainer;

    // To append to the document flow, recursive again create the contents of the HTML or execute the script
    this.addContainer();

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
            key: '__GarfishMockBody__',
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
            key: '__GarfishMockHead__',
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
            return DOMApis.createElement(node);
          }
          const { url, scriptCode } = jsManager;
          this.execScript(scriptCode, {}, url, {
            async: false,
            noEntry: Boolean(entryManager.findAttributeValue(node, 'no-entry')),
          });
        } else if (__DEV__) {
          const async = entryManager.findAttributeValue(node, 'async');
          if (!async) {
            const tipInfo = JSON.stringify(node, null, 2);
            warn(
              `The current js node cannot be found, maybe this is a bug.\n\n ${tipInfo}`,
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
          // styleManager.setScope(this.name);
          return styleManager.renderAsStyleElement();
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
    const hookRes =
      (await this.customLoader) &&
      this.customLoader(provider, appInfo, basename);

    if (hookRes) {
      const { mount, unmount } = hookRes || ({} as any);
      if (typeof mount === 'function' && typeof unmount === 'function') {
        mount._custom = true;
        unmount._custom = true;
        provider.render = mount;
        provider.destroy = unmount;
      }
    }

    assert(provider, `"provider" is "${typeof provider}".`);
    // No need to use "hasOwn", because "render" may be on the prototype chain
    assert('render' in provider, '"render" is required in provider.');
    assert('destroy' in provider, '"destroy" is required in provider.');

    this.provider = provider;
    return provider;
  }
}
