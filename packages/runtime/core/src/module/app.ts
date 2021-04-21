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
  public options: LoadAppOptions;
  public cjsModules: Record<string, any>;
  public customExports: Record<string, any> = {}; // 如果不希望使用 cjs 导出，可以用这个
  private active = false;
  public mounted = false;
  public appContainer: HTMLElement;
  private mounting: boolean = false;
  private unmounting: boolean = false;
  public provider: Provider | Promise<Provider>;
  private entryResManager: any;
  public htmlNode: HTMLElement | ShadowRoot;
  private resources?: ResourceModules;

  constructor(
    appInfo: AppInfo,
    options: LoadAppOptions,
    resources: ResourceModules,
  ) {
    this.appInfo = appInfo;
    this.options = options;
    this.name = appInfo.name;
    this.resources = resources;
    this.cjsModules = {
      exports: {},
      module: this.cjsModules,
      require: (_key: string) => null,
    };
  }

  get rootElement() {
    return findTarget(this.htmlNode, ['body', 'div[__GarfishMockBody__]']);
  }

  // TODO: 需要抽象不同的打包规范，获取导出内容抽象化
  // 获取导出内容
  getProvider() {
    return Promise.resolve(this.provider);
  }

  // TODO: 增加执行代码编译过程失败Hook
  execScript(
    code: string,
    env: Record<string, any>,
    url?: string,
    options?: { async?: boolean; noEntry?: boolean },
  ) {
    const sourceUrl = url ? `//# sourceURL=${url}\n` : '';
    const { noEntry, async } = options;

    try {
      evalWithEnv(`;${code}\n${sourceUrl}`, env);
    } catch (e) {
      // this.context.emit(ERROR_COMPILE_APP, this, e);
      throw e;
    }
  }

  // 应用挂载流程：
  // 「active」为true表明应用正在渲染中或者应用激活状态，为false表明正在销毁或者销毁完成（由于应用渲染和销毁都为异步事件，在渲染过程中执行到异步后可能会出现在异步的过程中同步的把应用销毁的情况，所以每次异步任务结束后需要判断能否继续渲染）
  // 「mounting」判断应用如果处于挂载过程中，终止（应用挂载为异步任务，避免重复挂载的情况出现）
  // 「mounted」如果应用已经处于渲染完成，(阻止继续渲染)重新进行渲染(废弃：需要将应用销毁后渲染，由于销毁时一个异步任务，所以销毁后将状态设置为可以继续渲染，不过再继续渲染时需要判断是否满足可以渲染的条件，列如是否在渲染中，是否已经渲染完成这两种情况不可以继续执行)
  //  编译执行代码过程中遇到异步任务需要终止,需要判断是否满足继续执行的条件
  //  「noCompile」参数用于判断子模块是否需要编译，可能会出现已经提前编译过的情况，已经拿到导出内容
  async mount() {
    // 如果正在挂载中不能进行挂载
    if (this.mounting) {
      __DEV__ && warn(`The ${this.appInfo.name} app mounting.`);
      return false;
    }

    // 如果应用已经渲染完成，再次渲染，需要先销毁在渲染
    if (this.mounted) {
      __DEV__ && warn(`The ${this.appInfo.name} app already mounted.`);
      return false;
    }

    // 应用处于销毁状态，需要销毁完成才能渲染
    if (this.unmounting) {
      __DEV__ &&
        warn(
          `The ${this.appInfo.name} app is unmounting can't Perform application rendering.`,
        );
      return false;
    }

    this.active = true;
    this.mounting = true;

    // 如果可以进行渲染，先将容器加到页面中
    this.addContainer();

    // mount执行的情况可能在compile之后，在之前的版本中存在先把代码编译拿到编译结果然后运行的情况
    await this.cjsCompile();
    if (!this.stopMountAndClearEffect()) return null;

    // 在编译的时候就设置好 provider
    if (this.stopMountAndClearEffect()) return null;
    this.provider = this.checkAndGetAppResult();

    const provider = await this.getProvider();
    if (this.stopMountAndClearEffect()) return null;
    this.callRender(provider);
  }

  async unmount() {}

  // private assertContinueMount () {
  // }

  // 如果在渲染过程中遇到异步任务，比如触发了执行代码前的beforeEval，异步任务结束后，需要判断是否应用已经销毁或者处于结束状态
  // 如果处于结束状态需要将执行渲染过程中产生的副作用移除，例如向文档上添加的挂载点，执行代码产生的环境副作用，并将渲染中的状态终止
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

  // 会执行子模块提供的js资源，最终拿到导出的内容
  async cjsCompile() {
    await hooks.lifecycle.beforeEval.promise('', this.appInfo);
    if (this.stopMountAndClearEffect()) return;

    // 如果不希望使用 cjs 导出，不是入口时可以不传递module、require、
    const Env = false
      ? { [__GARFISH_EXPORTS__]: this.customExports }
      : this.cjsModules;
    this.execScript('console.log()', Env);

    await hooks.lifecycle.afterEval.promise('', this.appInfo);
  }

  // 创建容器节点并添加在文档流中
  // TODO: 暂时无法做到完全按照浏览器渲染顺序执行，目前是通过直接将容器加载至文档中，再开始执行脚本

  private addContainer() {
    // domGetter 用到的时候再取
    const mountNode = getRenderNode(this.options.domGetter);
    rawAppendChild.call(mountNode, this.appContainer);
  }

  // 调用 render 对两种不同的沙箱做兼容处理
  private callRender(provider: Provider) {
    const { options, rootElement } = this;
    provider.render({
      dom: rootElement,
      basename: options.basename,
    });
  }

  // 调用 destroy 对两种不同的沙箱做兼容处理
  private callDestroy(provider: Provider, _isUnmount?: boolean) {
    const { rootElement, appContainer } = this;
    provider.destroy({ dom: rootElement });
  }

  private createContainer() {
    const { appInfo, options, entryResManager } = this;
    const baseUrl = entryResManager.opts.url;
    const { htmlNode, appContainer } = createAppContainer(appInfo.name);

    // 转换相对路径

    this.htmlNode = htmlNode;
    this.appContainer = appContainer;
    this.addContainer(); // 先 append 到文档流中，再递归创建 html 中的内容或者执行脚本

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
          if (!options.sandbox.strictIsolation) {
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
          if (!options.sandbox.strictIsolation) {
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

          const resource = this.resources.js.find((manager) => {
            if (!(manager as AsyncResource).async) {
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
            const resource = this.resources.link.find(
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

  private async checkAndGetAppResult() {
    const {
      options,
      context,
      appInfo,
      rootElement,
      cjsModules,
      customExports,
    } = this;
    const { props, basename } = options;
    let provider = (cjsModules.exports && cjsModules.exports.provider) as
      | Provider
      | ((...args: any[]) => Provider);

    // 自定义的 provider
    if (!provider) {
      provider = customExports.provider;
    }

    // provider 为函数，标准导出内容
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

    // provider 可能是一个函数对象
    if (!isObject(provider) && typeof provider !== 'function') {
      warn(
        ` Invalid module content: ${appInfo.name}, you should return both render and destroy functions in provider function.`,
      );
    }

    // 如果有 customLoader，把 provide 交由用户自行处理
    const hookRes = await context.callHooks('customLoader', options, [
      provider,
      appInfo,
      basename,
    ]);

    if (hookRes) {
      const { mount, unmount } = hookRes() || ({} as any);
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
