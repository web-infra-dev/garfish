import {
  assert,
  createElement,
  createLinkNode,
  createScriptNode,
  createStyleNode,
  evalWithEnv,
  findProp,
  findTarget,
  isCssLink,
  isJs,
  isObject,
  isPrefetchJsLink,
  isPromise,
  parseContentType,
  rawAppendChild,
  removeElement,
  toResolveUrl,
  transformCssUrl,
  transformUrl,
  VNode,
  VText,
  warn,
  createAppContainer,
  getRenderNode,
} from '@garfish/utils';
import Garfish, { interfaces } from '@garfish/core';
import { CustomerLoader } from '.';

const __GARFISH_EXPORTS__ = '__GARFISH_EXPORTS__';

export interface Provider {
  destroy: ({ dom: HTMLElement }) => void;
  render: ({ dom: HTMLElement, basename: string }) => void;
}

/**
 * Have the ability to App instance
 * 1. Provide static resource, the structure of the HTML, CSS, js
 * 2. Can be extracted in the js CJS through scope __GARFISH_EXPORTS__ namespace or get child application provider is deduced
 * 3. Through execCode incoming environment variables such as CJS specification of the module, the require, exports to realize external sharing
 * 4. Trigger rendering：Application related nodes placed in the document flow, which in turn perform application scripts, final render function, perform the son application provides complete application independent runtime execution
 * 5. Trigger the destruction：Perform the destroy function of child application, and applies the child node is removed from the document flow
 */
export class App {
  public name: string;
  public appInfo: interfaces.AppInfo;
  public cjsModules: Record<string, any>;
  public customExports: Record<string, any> = {}; // If you don't want to use the CJS export, can use this
  private active = false;
  public mounted = false;
  public appContainer: HTMLElement;
  private mounting: boolean = false;
  private unmounting: boolean = false;
  public provider: Provider;
  public entryResManager: interfaces.HtmlResource;
  public htmlNode: HTMLElement | ShadowRoot;
  private resources: interfaces.ResourceModules;
  public isHtmlMode: boolean;
  private context: Garfish;
  public strictIsolation = false;
  public customLoader: CustomerLoader;

  constructor(
    context: Garfish,
    appInfo: interfaces.AppInfo,
    entryResManager: interfaces.HtmlResource,
    resources: interfaces.ResourceModules,
    isHtmlMode: boolean,
    customLoader: CustomerLoader,
  ) {
    this.context = context;
    // get container dom
    appInfo.domGetter = getRenderNode(appInfo.domGetter);

    this.appInfo = appInfo;
    this.name = appInfo.name;

    this.resources = resources;
    this.entryResManager = entryResManager;
    this.isHtmlMode = isHtmlMode;
    this.cjsModules = {
      exports: {},
      module: this.cjsModules,
      require: (_key: string) => null,
    };
    this.customLoader = customLoader;
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
    env = this.getExecScriptEnv(options?.noEntry);

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
    this.context.hooks.lifecycle.afterEval.call(
      this.appInfo,
      code,
      env,
      url,
      options,
    );
  }

  getExecScriptEnv(noEntry: boolean) {
    return noEntry
      ? { [__GARFISH_EXPORTS__]: this.customExports }
      : this.cjsModules;
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

  async mount() {
    if (!this.canMount()) return;
    this.context.hooks.lifecycle.beforeMount.call(this.appInfo, this);

    this.active = true;
    this.mounting = true;
    try {
      // add container and compile js with cjs
      this.cjsCompileAndRenderContainer();

      // Good provider is set at compile time
      const provider = await this.checkAndGetProvider();

      // Existing asynchronous functions need to decide whether the application has been unloaded
      if (!this.stopMountAndClearEffect()) return false;
      this.callRender(provider);

      this.context.hooks.lifecycle.afterMount.call(this.appInfo, this);
    } catch (err) {
      removeElement(this.appContainer);
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
    this.unmounting = false;

    this.context.hooks.lifecycle.afterUnMount.call(this.appInfo, this);
    return true;
  }

  // If asynchronous task encountered in the rendering process, such as triggering the beforeEval before executing code, after the asynchronous task, you need to determine whether the application has been destroyed or in the end state
  // If in the end state will need to perform the side effects of removing rendering process, adding a mount point to a document, for example, execute code of the environmental effects, and rendering the state in the end
  private stopMountAndClearEffect() {
    if (!this.active) {
      if (__DEV__) {
        warn(`The app "${this.name}" rendering process has been blocked.`);
      }
      this.mounting = false;
      // Will have been added to the document flow on the container
      if (this.appContainer) removeElement(this.appContainer);
      return false;
    }
    return true;
  }

  // Performs js resources provided by the module, finally get the content of the export
  public cjsCompileAndRenderContainer() {
    const { resources } = this;

    // Render the application node
    this.renderHtml();
    //Execute asynchronous script

    // If you don't want to use the CJS export, at the entrance is not can not pass the module, the require
    for (const manager of resources.js) {
      console.log(manager);
    }
  }

  // 调用 render 对两种不同的沙箱做兼容处理
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
    removeElement(appContainer);
  }

  // Create a container node and add in the document flow
  // domGetter Have been dealing with
  private addContainer() {
    rawAppendChild.call(this.appInfo.domGetter, this.appContainer);
  }

  private renderHtml() {
    const { appInfo, entryResManager, resources } = this;
    const baseUrl = entryResManager.opts.url;
    const { htmlNode, appContainer } = createAppContainer(appInfo.name);

    // Transformation relative path
    this.htmlNode = htmlNode;
    this.appContainer = appContainer;

    // To append to the document flow, recursive again create the contents of the HTML or execute the script
    this.addContainer();

    entryResManager.renderElements(
      {
        meta: () => null,
        a: (vnode) => {
          toResolveUrl(vnode, 'href', baseUrl);
          return createElement(vnode);
        },
        img: (vnode) => {
          toResolveUrl(vnode, 'src', baseUrl);
          return createElement(vnode);
        },
        // body 和 head 这样处理是为了兼容旧版本
        body: (vnode) => {
          if (!this.strictIsolation) {
            vnode.tagName = 'div';
            vnode.attributes.push({
              key: '__GarfishMockBody__',
              value: null,
            });
            return createElement(vnode);
          } else {
            return createElement(vnode);
          }
        },
        head: (vnode) => {
          if (!this.strictIsolation) {
            vnode.tagName = 'div';
            vnode.attributes.push({
              key: '__GarfishMockHead__',
              value: null,
            });
            return createElement(vnode);
          } else {
            return createElement(vnode);
          }
        },
        script: (vnode) => {
          const type = findProp(vnode, 'type');
          const mimeType = type?.value;
          if (mimeType) {
            if (mimeType === 'module') return null;
            if (!isJs(parseContentType(mimeType))) {
              return createElement(vnode);
            }
          }

          const resource = resources.js.find((manager) => {
            if (!(manager as any).async) {
              if (vnode.key) {
                return vnode.key === (manager as any).key;
              }
            }
            return false;
          });

          if (resource) {
            const { code, url } = (resource as any).opts;
            this.execScript(code, {}, url, {
              async: false,
              noEntry: !!findProp(vnode, 'no-entry'),
            });
          } else if (__DEV__) {
            const async = findProp(vnode, 'async');
            if (!async) {
              const nodeStr = JSON.stringify(vnode, null, 2);
              warn(`The current js node cannot be found.\n\n ${nodeStr}`);
            }
          }
          return createScriptNode(vnode);
        },

        style: (vnode) => {
          const text = vnode.children[0] as VText;
          if (text) {
            text.content = transformCssUrl(baseUrl, text.content);
          }
          return createElement(vnode);
        },

        link: (vnode) => {
          if (isCssLink(vnode)) {
            const href = findProp(vnode, 'href');
            const resource = this.resources.link.find(({ opts }) => {
              if (!href) return false;
              return opts.url === transformUrl(baseUrl, href.value);
            });
            if (!resource) {
              return createElement(vnode);
            }

            const { url, code } = resource.opts;
            const content = __DEV__
              ? `\n/*${createLinkNode(vnode)}*/\n${code}`
              : code;

            if (resource.type !== 'css') {
              warn(`The current resource type does not match. "${url}"`);
              return null;
            }
            return createStyleNode(content);
          }
          return isPrefetchJsLink(vnode)
            ? createScriptNode(vnode)
            : createElement(vnode);
        },
      },
      htmlNode,
    );
  }

  private async checkAndGetProvider() {
    const { appInfo, rootElement, cjsModules, customExports } = this;
    const { props, basename } = appInfo;

    let provider = (cjsModules.exports && cjsModules.exports.provider) as
      | interfaces.Provider
      | ((...args: any[]) => interfaces.Provider);

    // The custom of the provider
    if (!provider) {
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

    // 如果有 customLoader，把 provide 交由用户自行处理
    const hookRes = await this.customLoader(provider, appInfo, basename);

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
    assert('render' in provider, '"render" is required in provider.');
    assert('destroy' in provider, '"destroy" is required in provider.');

    this.provider = provider;
    return provider;
  }
}
