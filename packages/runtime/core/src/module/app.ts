import { AppInfo, LoadAppOptions, Provider } from '../type';
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
} from '@garfish/utils';
import { hooks } from '../utils/hooks';
import { createAppContainer, getRenderNode } from '../utils';
import { renderContainer } from './htmlRender'
import { HtmlResource } from './source';

const __GARFISH_EXPORTS__ = '__GARFISH_EXPORTS__';

type AsyncResource = {
  async: boolean;
  content: () => Promise<any>;
};

export interface ResourceModules {
  link: Array<any>;
  js: Array<any | AsyncResource>;
}

/**
 * App 实例具备的能力
 * 1. 提供静态资源、html结构、css、js
 * 2. 可以提取js中cjs或者通过作用域__GARFISH_EXPORTS__命名空间拿到子应用导出的provider
 * 3. 通过execCode传入环境变量例如cjs规范的module、require、exports来实现external共享
 * 4. 触发渲染：子应用相关节点放置文档流中，依次执行子应用的脚本、最终执行子应用提供的render函数，完成子应用独立运行时的执行操作
 * 5. 触发销毁：执行子应用的destroy函数，并将子应用的节点从文档流中移除
 */
export class App {
  public name: string;
  public appInfo: AppInfo;
  public cjsModules: Record<string, any>;
  public customExports: Record<string, any> = {}; // 如果不希望使用 cjs 导出，可以用这个
  private active = false;
  public mounted = false;
  public appContainer: HTMLElement;
  private mounting: boolean = false;
  private unmounting: boolean = false;
  public provider: Provider;
  private entryResManager: HtmlResource;
  public htmlNode: HTMLElement | ShadowRoot;
  private resources: ResourceModules;
  public isHtmlMode: boolean;

  constructor(
    appInfo: AppInfo,
    entryResManager: HtmlResource,
    resources: ResourceModules,
    isHtmlMode: boolean
  ) {
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
  }

  get rootElement() {
    return findTarget(this.htmlNode, ['body', 'div[__GarfishMockBody__]']);
  }

  // TODO: 增加执行代码编译过程失败Hook
  execScript(
    code: string,
    env?: Record<string, any>,
    url?: string,
    options?: { async?: boolean; noEntry?: boolean },
  ) {
    const sourceUrl = url ? `//# sourceURL=${url}\n` : '';

    // execEnv
    if (!env) {
      env = options?.noEntry
      ? { [__GARFISH_EXPORTS__]: this.customExports }
      : this.cjsModules;
    }

    try {
      evalWithEnv(`;${code}\n${sourceUrl}`, env);
    } catch (e) {
      // this.context.emit(ERROR_COMPILE_APP, this, e);
      throw e;
    }
  }

  private canMount (){
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

  // 应用挂载流程：
  // 「active」为true表明应用正在渲染中或者应用激活状态，为false表明正在销毁或者销毁完成（由于应用渲染和销毁都为异步事件，在渲染过程中执行到异步后可能会出现在异步的过程中同步的把应用销毁的情况，所以每次异步任务结束后需要判断能否继续渲染）
  // 「mounting」判断应用如果处于挂载过程中，终止（应用挂载为异步任务，避免重复挂载的情况出现）
  // 「mounted」如果应用已经处于渲染完成，(阻止继续渲染)重新进行渲染(废弃：需要将应用销毁后渲染，由于销毁时一个异步任务，所以销毁后将状态设置为可以继续渲染，不过再继续渲染时需要判断是否满足可以渲染的条件，列如是否在渲染中，是否已经渲染完成这两种情况不可以继续执行)
  //  编译执行代码过程中遇到异步任务需要终止,需要判断是否满足继续执行的条件
  //  「noCompile」参数用于判断子模块是否需要编译，可能会出现已经提前编译过的情况，已经拿到导出内容
  async mount() {
    if (!this.canMount()) return;

    this.active = true;
    this.mounting = true;

    // add container and compile js with cjs
    this.cjsCompileAndRenderContainer();

    // Good provider is set at compile time
    const provider = await this.checkAndGetProvider();

    // Existing asynchronous functions need to decide whether the application has been unloaded
    if (!this.stopMountAndClearEffect()) return false;
    this.callRender(provider);
  }

  async unmount() {
    this.active = false;
    if (this.unmounting) {
      __DEV__ && warn(`The ${this.name} app unmounting.`);
      return false;
    }

    this.callDestroy(this.provider);
    this.unmounting = false;
    return true;
  }

  // private assertContinueMount () {
  // }

  // If asynchronous task encountered in the rendering process, such as triggering the beforeEval before executing code, after the asynchronous task, you need to determine whether the application has been destroyed or in the end state
  // If in the end state will need to perform the side effects of removing rendering process, adding a mount point to a document, for example, execute code of the environmental effects, and rendering the state in the end
  private stopMountAndClearEffect() {
    if (!this.active) {
      if (__DEV__) {
        warn(`The app "${this.name}" rendering process has been blocked.`);
      }
      this.mounting = false;
      // 将已经 append 到文档流上的容器删掉
      if (this.appContainer) removeElement(this.appContainer);
      return false;
    }
    return true;
  }

  // Performs js resources provided by the module, finally get the content of the export
  public cjsCompileAndRenderContainer() {
    hooks.lifecycle.beforeEval.promise('', this.appInfo);

    // Render the application node
    this.renderHtml();
    //Execute asynchronous script
    this.execAsyncScript();

    hooks.lifecycle.afterEval.promise('', this.appInfo);
  }

  public cjsCompile () {

  }

  // 调用 render 对两种不同的沙箱做兼容处理
  private callRender(provider: Provider) {
    const { appInfo, rootElement } = this;
    provider.render({
      dom: rootElement,
      basename: appInfo.basename,
    });
  }

  // Call to destroy do compatible with two different sandbox
  private callDestroy(provider: Provider) {
    const { rootElement, appContainer } = this;
    provider.destroy({ dom: rootElement });
    removeElement(appContainer);
  }

  // Create a container node and add in the document flow
  private addContainer() {
    // domGetter Have been dealing with
    rawAppendChild.call(this.appInfo.domGetter, this.appContainer);
  }

  private renderHtml() {
    const { appInfo, entryResManager, resources } = this;
    const baseUrl = entryResManager.opts.url;
    const { htmlNode, appContainer } = createAppContainer(appInfo.name);
    const strictIsolation = false;

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
          if (!strictIsolation) {
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
          if (!strictIsolation) {
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
            this.execScript(code, null, url, {
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
            const resource = resources.link.find(
              ({ opts }) => opts.url === href?.value,
            );
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

  private execAsyncScript () {
    let { resources } = this;
    // If you don't want to use the CJS export, at the entrance is not can not pass the module, the require
    // this.execScript('console.log()');


    for (const manager of resources.js) {
      console.log(manager);
    }
  }

  private async checkAndGetProvider() {
    const {
      appInfo,
      rootElement,
      cjsModules,
      customExports,
    } = this;
    const { props, basename } = appInfo;
    let provider = (cjsModules.exports && cjsModules.exports.provider) as
      | Provider
      | ((...args: any[]) => Provider);

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
    // const hookRes = await context.callHooks('customLoader', options, [
    //   provider,
    //   appInfo,
    //   basename,
    // ]);

    // if (hookRes) {
    //   const { mount, unmount } = hookRes() || ({} as any);
    //   if (typeof mount === 'function' && typeof unmount === 'function') {
    //     mount._custom = true;
    //     unmount._custom = true;
    //     provider.render = mount;
    //     provider.destroy = unmount;
    //   }
    // }

    assert(provider, `"provider" is "${typeof provider}".`);
    assert('render' in provider, '"render" is required in provider.');
    assert('destroy' in provider, '"destroy" is required in provider.');

    this.provider = provider;
    return provider;
  }
}
