import {
  warn,
  assert,
  VNode,
  VText,
  remove,
  findProp,
  findTarget,
  isObject,
  isCssLink,
  isPrefetchJsLink,
  removeElement,
  createElement,
  createLinkNode,
  createStyleNode,
  createScriptNode,
  transformUrl,
  transformCssUrl,
  rawAppendChild,
} from '@garfish/utils';
import Sandbox, { SnapshotSandbox } from '@garfish/sandbox';
import {
  END_COMPILE_APP,
  END_MOUNT_APP,
  END_UNMOUNT_APP,
  ERROR_COMPILE_APP,
  ERROR_MOUNT_APP,
  ERROR_UNMOUNT_APP,
  START_COMPILE_APP,
  START_MOUNT_APP,
  START_UNMOUNT_APP,
} from '../eventTypes';
import { Garfish } from '../garfish';
import { getRenderNode, createAppContainer } from '../utils';
import { AppInfo, Provider, LoadAppOptions } from '../config';
import { CssResource, JsResource, HtmlResource } from './loader';

export interface ResourceModules {
  link: Array<CssResource>;
  js: Array<JsResource | AsyncResource>;
}

type AsyncResource = {
  async: boolean;
  content: () => Promise<JsResource>;
};

let appId = 0;

export class App {
  public id = appId++;
  public mounted = false;
  public display = false;
  public sandboxType = 'vm';

  public name: string;
  public isHtmlMode: boolean;
  public cjsModules: Record<string, any>;
  public context: Garfish;
  public appInfo: AppInfo;
  public options: LoadAppOptions;
  public sandbox: Sandbox | SnapshotSandbox;
  public provider: Provider | Promise<Provider>;
  public appContainer: HTMLElement;
  public htmlNode: HTMLElement | ShadowRoot;

  private mounting: boolean = false;
  private unmounting: boolean = false;

  // 整个渲染流程涉及到异步的钩子，设置 active 属性用于阻止渲染编译流程进一步往下走
  private active = false;
  private resources?: ResourceModules;
  private entryResManager: HtmlResource;

  constructor(
    context: Garfish,
    appInfo: AppInfo,
    options: LoadAppOptions,
    entryResManager: HtmlResource,
    resources: ResourceModules,
    isHtmlMode: boolean,
    isSnapshot: boolean = false, // 作为基类要传进来
  ) {
    this.options = options;
    this.context = context;
    this.appInfo = appInfo;
    this.name = appInfo.name;
    this.resources = resources;
    this.isHtmlMode = isHtmlMode;
    this.cjsModules = { exports: {} };
    this.entryResManager = entryResManager;

    // 初始化沙箱
    if (!isSnapshot) {
      this.sandbox = new Sandbox({
        namespace: appInfo.name,
        baseUrl: entryResManager.opts.url,
        hooks: options.sandbox.hooks || {},
        openSandbox: options.sandbox.open,
        useStrict: options.sandbox.useStrict,
        strictIsolation: options.sandbox.strictIsolation,
        protectVariable: () => options.protectVariable,
        insulationVariable: () => options.insulationVariable,
        modules: {
          ...(options.sandbox.modules || {}),
          getCjsModules: () => ({
            override: {
              module: this.cjsModules,
              exports: this.cjsModules.exports,
              require: (key: string) => context.externals[key],
            },
          }),
        },
      });
    }
  }

  get rootElement() {
    return this.isHtmlMode
      ? this.htmlNode
      : findTarget(this.htmlNode, ['body', 'div[__GarfishMockBody__]']);
  }

  isSnapshotSandbox() {
    return this.sandboxType === 'snapshot';
  }

  getProvider() {
    return Promise.resolve(this.provider);
  }

  show() {
    this.active = true;
    const { display, mounted, provider } = this;
    if (display) return false;
    if (!mounted) {
      __DEV__ && warn('Need to call the "app.mount()" method first.');
      return false;
    }

    this.addToDocument();
    this.callRender(provider as Provider);
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

    this.callDestroy(provider as Provider);
    this.display = false;
    return true;
  }

  // mount 的代价很昂贵，文档中要着重提出一下
  async mount(noCompile?: boolean) {
    this.active = true;
    if (this.mounting) {
      __DEV__ && warn(`The ${this.name} app mounting.`);
      return false;
    }
    this.mounting = true;

    if (this.mounted) {
      __DEV__ && warn(`The ${this.name} app already mounted.`);
      const process = this.unmount();
      this.active = true;
      await process;
      if (!this.assertContinueMount()) {
        return false;
      }
    }

    // 这个参数主要是兼容旧的代码，不应该给用户使用
    if (!noCompile) {
      await this.compile(true);
      if (!this.assertContinueMount()) {
        return false;
      }
    }

    const provider = await this.getProvider();
    const { options, appInfo, context, appContainer } = this;

    try {
      const hookArgs: [AppInfo, string] = [appInfo, options.basename];
      await context.callHooks('beforeMount', options, hookArgs);
      context.emit(START_MOUNT_APP, this);

      if (!this.assertContinueMount()) {
        return false;
      }

      this.callRender(provider);

      this.display = true;
      this.mounted = true;
      this.context.activeApps.push(this);
      await this.context.callHooks('afterMount', options, hookArgs);
      context.emit(END_MOUNT_APP, this);
    } catch (e) {
      removeElement(appContainer);
      context.emit(ERROR_MOUNT_APP, this, e);
      await context.callHooks('errorMountApp', options, [e, appInfo]);
      return false;
    } finally {
      this.mounting = false;
    }
    return true;
  }

  async unmount() {
    this.active = false;
    if (this.unmounting) {
      __DEV__ && warn(`The ${this.name} app unmounting.`);
      return false;
    }
    const { options, mounted, appInfo, provider, context, appContainer } = this;

    if (!mounted || !appContainer) {
      return false;
    }
    this.unmounting = true;

    try {
      const hookArgs: [AppInfo, string] = [appInfo, options.basename];
      await context.callHooks('beforeUnmount', options, hookArgs);
      context.emit(START_UNMOUNT_APP, this);

      this.callDestroy(provider as Provider, true);

      this.display = false;
      this.mounted = false;

      remove(this.context.activeApps, this);
      await context.callHooks('afterUnmount', options, hookArgs);
      context.emit(END_UNMOUNT_APP, this);
    } catch (e) {
      remove(this.context.activeApps, this);
      context.emit(ERROR_UNMOUNT_APP, this, e);
      await context.callHooks('errorUnmountApp', options, [e, appInfo]);
      return false;
    } finally {
      this.unmounting = false;
    }
    return true;
  }

  // compile 会同步将 dom 渲染到容器里
  // 通过 compile 的返回值判断是否编译成功
  async compile(genProvider?: boolean) {
    this.active = true;
    const isSnapshotSandbox = this.isSnapshotSandbox();
    const { options, appInfo, context, resources, entryResManager } = this;

    await context.callHooks('beforeEval', options, [appInfo, options.basename]);

    if (!this.assertContinueMount()) {
      return false;
    }

    this.sandBoxActive(true);
    this.createContainer(); // 每次编译都生成新的 container
    context.emit(START_COMPILE_APP, this);

    const destination = async () => {
      // 触发 window.onload 事件,
      // 不能用 dispatchEvent 触发，因为会污染其他的子应用和主应用
      this.execScript(`
        if (typeof window.onload === 'function') {
          (window.onload._native || window.onload).call(window, new Event('load'));
        }
      `);
      context.emit(END_COMPILE_APP, this);

      if (isSnapshotSandbox) {
        this.sandBoxDeactivate(true);
      }

      // 在编译的时候就设置好 provider
      if (genProvider && this.assertContinueMount()) {
        this.provider = this.checkAndGetAppResult();
      }

      await context.callHooks('afterEval', options, [
        appInfo,
        options.basename,
      ]);
      return true;
    };

    // 执行脚本
    if (entryResManager.type === 'html') {
      // 执行异步脚本，同步的已经在 dom 的创建过程中执行了
      let completedCount = 0;
      const done = () => ++completedCount === resources.js.length;

      // 包装所有的异步脚本执行，不管是否有错误，都要走下去调用钩子以及 onload 事件
      return new Promise<boolean>((resolve) => {
        let breakLoop = false;

        for (const manager of resources.js) {
          if (breakLoop) {
            // 如果整个编译流程被阻止了，需要 return false
            resolve(false);
            break;
          }

          if ((manager as AsyncResource).async) {
            (manager as AsyncResource)
              .content()
              .then(({ opts: { code, url } }) => {
                if (this.assertContinueMount()) {
                  this.execScript(code, url, true);
                  done() && resolve(destination());
                } else {
                  breakLoop = true;
                }
              })
              .catch((e) => {
                if (this.assertContinueMount()) {
                  done() && resolve(destination());
                } else {
                  breakLoop = true;
                }
                throw e; // 向上抛出错误
              });
          } else {
            if (done()) {
              resolve(destination());
            }
          }
        }
      });
    } else {
      warn('can`t compile');
      return false;
    }
  }

  // 兼容
  sandBoxActive(_?: boolean) {}
  sandBoxDeactivate(_isCompile?: boolean) {}

  // 兼容 snapshotApp
  execScript(code: string, url?: string, async?: boolean) {
    try {
      (this.sandbox as Sandbox).execScript(code, url, async);
    } catch (e) {
      this.context.emit(ERROR_COMPILE_APP, this, e);
      throw e;
    }
  }

  private assertContinueMount() {
    if (!this.active) {
      if (__DEV__) {
        warn(`The app "${this.name}" rendering process has been blocked.`);
      }
      this.mounting = false;
      // 将已经 append 到文档流上的容器删掉
      if (this.appContainer) {
        removeElement(this.appContainer);
      }
      if (!this.isSnapshotSandbox()) {
        (this.sandbox as Sandbox).clearEffects();
      }
      return false;
    }
    return true;
  }

  private addToDocument() {
    // domGetter 用到的时候再取
    const mountNode = getRenderNode(this.options.domGetter);
    rawAppendChild.call(mountNode, this.appContainer);
  }

  // 调用 render 对两种不同的沙箱做兼容处理
  private callRender(provider: Provider) {
    const { options, rootElement } = this;

    if (this.isSnapshotSandbox()) {
      try {
        this.sandBoxActive();
        provider.render({
          dom: rootElement,
          basename: options.basename,
        });
      } catch (e) {
        this.sandBoxDeactivate();
        throw e; // 直接暴露，上层会接收
      }
    } else {
      provider.render({
        dom: rootElement,
        basename: options.basename,
      });
    }
  }

  // 调用 destroy 对两种不同的沙箱做兼容处理
  private callDestroy(provider: Provider, isUnmount?: boolean) {
    const { sandbox, rootElement, appContainer } = this;
    if (this.isSnapshotSandbox()) {
      try {
        this.sandBoxActive();
        provider.destroy({ dom: rootElement });
        removeElement(appContainer);
      } finally {
        this.sandBoxDeactivate();
      }
    } else {
      provider.destroy({ dom: rootElement });
      isUnmount && (sandbox as Sandbox).clearEffects();
      // 清除副作用
      removeElement(appContainer);
    }
  }

  private createContainer() {
    const { appInfo, options, sandbox, entryResManager } = this;
    const baseUrl = entryResManager.opts.url;
    const { htmlNode, appContainer } = createAppContainer(
      appInfo.name,
      options.sandbox.strictIsolation,
    );

    // 转换相对路径
    const toResolveUrl = (vnode: VNode, urlKey: string) => {
      const src = findProp(vnode, urlKey);
      if (src) {
        src.value = transformUrl(baseUrl, src.value);
      }
    };

    this.htmlNode = htmlNode;
    this.appContainer = appContainer;
    this.addToDocument(); // 先 append 到文档流中，再递归创建 html 中的内容或者执行脚本
    this.sandBoxActive();

    if (!this.isSnapshotSandbox()) {
      // 每次创建新的容器时都是全新的 dom
      (sandbox as Sandbox).options.el = () => htmlNode;
    }

    entryResManager.renderElements(
      {
        meta: () => null,

        a: (vnode) => {
          toResolveUrl(vnode, 'href');
          return createElement(vnode);
        },

        img: (vnode) => {
          toResolveUrl(vnode, 'src');
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
          if (type?.value === 'module') return null;

          const resource = this.resources.js.find((manager) => {
            if (!(manager as AsyncResource).async) {
              if (vnode.key) {
                return vnode.key === (manager as JsResource).key;
              }
            }
            return false;
          });

          if (resource) {
            const { code, url } = (resource as JsResource).opts;
            this.execScript(code, url, false);
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

    // 关掉沙盒
    this.sandBoxDeactivate();
  }

  private async checkAndGetAppResult() {
    const { options, context, appInfo, rootElement, cjsModules } = this;
    const { props, basename } = options;
    let provider = (cjsModules.exports && cjsModules.exports.provider) as
      | Provider
      | ((...args: any[]) => Provider);

    if (typeof provider === 'function') {
      provider = await provider({
        basename,
        dom: rootElement,
        ...(props || {}),
        ...(appInfo.props || {}),
      });
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
