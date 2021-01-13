import {
  warn,
  assert,
  VNode,
  VText,
  remove,
  toBoolean,
  isCssLink,
  isPrefetchJsLink,
  removeElement,
  createElement,
  createLinkNode,
  createStyleNode,
  createScriptNode,
  rawAppendChild,
  transformUrl,
  transformCssUrl,
} from '@garfish/utils';
import SandBox, { SnapshotSandbox } from '@garfish/sandbox';
import { Garfish } from '../garfish';
import { getRenderNode, createAppContainer } from '../utils';
import { AppInfo, Provider, LoadAppOptions } from '../config';
import { CssResource, JsResource, HtmlResource } from './loader';
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
} from '../eventFlags';

export interface ResourceModules {
  link: Array<CssResource>;
  js: Array<
      | JsResource
      | {
    async: boolean;
    content: () => Promise<JsResource>;
  }
      >;
}

let appId = 0;

export class App {
  public id = appId++;
  public mounted = false;
  public display = false;

  public sandboxType = 'vm';
  public name: string;
  public isHtmlMode: boolean;
  public container: HTMLElement;
  public cjsModules: Record<string, any>;
  public context: Garfish;
  public appInfo: AppInfo;
  public opts: LoadAppOptions;
  public sandbox: SandBox | SnapshotSandbox;
  public provider: Provider | Promise<Provider>;

  // 整个渲染流程涉及到异步的钩子，设置 active 属性用于阻止渲染编译流程进一步往下走
  private active = false;
  private mounting = false;
  private unmounting = false;
  private mockBody?: HTMLElement;
  private resources?: ResourceModules;
  private entryResManager: HtmlResource | JsResource;

  constructor(
      context: Garfish,
      appInfo: AppInfo,
      opts: LoadAppOptions,
      entryResManager: HtmlResource | JsResource,
      resources?: ResourceModules,
  ) {
    this.opts = opts;
    this.context = context;
    this.appInfo = appInfo;
    this.name = appInfo.name;
    this.cjsModules = { exports: {} };
    this.resources = resources;
    this.entryResManager = entryResManager;
    this.isHtmlMode = entryResManager.type === 'html';

    // 初始化沙箱
    if (!this.isSnapshotSandbox()) {
      this.sandbox = new SandBox({
        namespace: appInfo.name,
        openSandBox: opts.sandbox.open,
        proxyBody: opts.sandbox.proxyBody,
        useStrict: opts.sandbox.useStrict,
        baseUrl: entryResManager.opts.url,
        protectVariable: () => opts.protectVariable,
        insulationVariable: () => opts.insulationVariable,
        modules: {
          ...(opts.sandbox.modules || {}),
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

  isSnapshotSandbox() {
    return this.sandboxType === 'snapshot';
  }

  getProvider() {
    return Promise.resolve(this.provider);
  }

  show() {
    this.active = true;
    const { display, mounted, provider } = this;
    if (display) return;
    if (!mounted) {
      __DEV__ && warn('Need to call the "app.mount()" method first.');
      return;
    }

    this.callRender(provider as Provider);
    this.display = true;
  }

  hide() {
    this.active = false;
    const { display, mounted, provider } = this;
    if (!display) return;
    if (!mounted) {
      __DEV__ && warn('Need to call the "app.mount()" method first.');
      return;
    }

    this.callDestroy(provider as Provider);
    this.display = false;
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
      await this.unmount();
      if (!this.assertContinueMount()) {
        return false;
      }
    }

    // 这个参数主要是兼容旧的代码，不应该给用户使用
    if (!noCompile) {
      await this.compile();
      if (!this.assertContinueMount()) {
        return false;
      }
      this.provider = this.checkAndGetAppResult();
    }

    const provider = await this.provider;
    const { opts, appInfo, context, container } = this;

    try {
      const hookArgs = [appInfo, opts.basename];
      await context.callHooks('beforeMount', hookArgs);
      context.emit(START_MOUNT_APP, this);

      if (!this.assertContinueMount()) {
        return false;
      }

      this.callRender(provider);

      this.display = true;
      this.mounted = true;
      this.context.activeApps.push(this);
      await this.context.callHooks('afterMount', hookArgs);
      context.emit(END_MOUNT_APP, this);
    } catch (e) {
      removeElement(container);
      context.emit(ERROR_MOUNT_APP, this, e);
      await context.callHooks('errorMountApp', [e, appInfo]);
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
    const { opts, mounted, appInfo, provider, context, container } = this;

    if (!mounted || !container) {
      return false;
    }
    this.unmounting = true;

    try {
      const hookArgs = [appInfo, opts.basename];
      await context.callHooks('beforeUnmount', hookArgs);
      context.emit(START_UNMOUNT_APP, this);

      this.callDestroy(provider as Provider, true);

      this.display = false;
      this.mounted = false;

      remove(this.context.activeApps, this);
      await context.callHooks('afterUnmount', hookArgs);
      context.emit(END_UNMOUNT_APP, this);
    } catch (e) {
      remove(this.context.activeApps, this);
      context.emit(ERROR_UNMOUNT_APP, this, e);
      await context.callHooks('errorUnmountApp', [e, appInfo]);
    } finally {
      this.unmounting = false;
    }
    return true;
  }

  async compile() {
    const { opts, appInfo, context, resources, entryResManager } = this;
    const isSnapshotSandbox = this.isSnapshotSandbox();

    await context.callHooks('beforeEval', [appInfo, opts.basename]);

    if (!this.assertContinueMount()) return;

    if (isSnapshotSandbox) {
      this.sandBoxActive(true);
    }

    // 每次编译都生成新的 container
    this.createContainer();
    context.emit(START_COMPILE_APP, this);

    try {
      if (entryResManager.type === 'js') {
        const { url, code } = entryResManager.opts;
        this.execScript(code, url);
      } else if (entryResManager.type === 'html') {
        const jsList = resources.js;

        if (jsList.length > 0) {
          const execScript = ({
                                opts: { url, code, attributes },
                              }: JsResource) => {
            // 允许 script 标签上指定是否使用严格模式
            const garfishUseStrict = attributes.find(
                ({ key }) => key.toLowerCase() === 'garfishusestrict',
            );
            garfishUseStrict
                ? this.execScript(code, url, toBoolean(garfishUseStrict.value))
                : this.execScript(code, url);
          };

          for (const manager of jsList) {
            type AsyncResource = Exclude<typeof manager, JsResource>;
            if ((manager as AsyncResource).async) {
              (manager as AsyncResource).content().then(execScript);
            } else {
              execScript(manager as JsResource);
            }
          }
        }
      } else {
        warn('can`t compile');
      }
      context.emit(END_COMPILE_APP, this);
    } catch (e) {
      context.emit(ERROR_COMPILE_APP, this, e);
      throw e;
    } finally {
      if (isSnapshotSandbox) {
        this.sandBoxDeactivate();
      }
      await context.callHooks('afterEval', [appInfo, opts.basename]);
    }
  }

  // 兼容
  sandBoxActive(_?: boolean) {}
  sandBoxDeactivate() {}

  execScript(code: string, url: string, useStrict?: boolean) {
    (this.sandbox as SandBox).execScript(code, url, useStrict);
  }

  private assertContinueMount() {
    if (!this.active) {
      if (__DEV__ && !__TEST__) {
        warn(`The app "${this.name}" rendering process has been blocked.`);
      }
      this.mounting = false;
      return false;
    }
    return true;
  }

  // 调用 render 对两种不同的沙箱做兼容处理
  private callRender(provider: Provider) {
    const { opts, mockBody, container, isHtmlMode } = this;
    if (!isHtmlMode) {
      rawAppendChild.call(container, mockBody);
    }
    // domGetter 用到的时候再取
    rawAppendChild.call(getRenderNode(opts.domGetter), container);

    if (this.isSnapshotSandbox()) {
      try {
        this.sandBoxActive();
        provider.render({
          basename: opts.basename,
          dom: isHtmlMode ? container : mockBody,
        });
      } catch (e) {
        this.sandBoxDeactivate();
        throw e; // 直接暴露，上层会接收
      }
    } else {
      provider.render({
        basename: opts.basename,
        dom: isHtmlMode ? container : mockBody,
      });
    }
  }

  // 调用 destroy 对两种不同的沙箱做兼容处理
  private callDestroy(provider: Provider, isUnmount?: boolean) {
    const { sandbox, mockBody, container, isHtmlMode } = this;
    if (this.isSnapshotSandbox()) {
      try {
        this.sandBoxActive();
        provider.destroy({ dom: isHtmlMode ? container : mockBody });
        removeElement(container);
      } finally {
        this.sandBoxDeactivate();
      }
    } else {
      provider.destroy({ dom: isHtmlMode ? container : mockBody });
      isUnmount && (sandbox as SandBox).clearEffects();
      // 清除副作用
      removeElement(container);
    }
  }

  private createContainer() {
    const { sandbox, isHtmlMode, entryResManager } = this;
    const container = createAppContainer(this.appInfo.name);
    const baseUrl = entryResManager.opts.url;

    if (!this.isSnapshotSandbox()) {
      // 每次创建新的容器时都是全新的 dom
      (sandbox as SandBox).options.el = () => container;
    }

    if (isHtmlMode) {
      // 转换相对路径
      const toResolveUrl = (vnode: VNode, urlKey: string) => {
        const src = vnode.attributes.find(({ key }) => key === urlKey);
        if (src) {
          src.value = transformUrl(baseUrl, src.value);
        }
      };

      (entryResManager as HtmlResource)
          .renderToElement({
            a: (vnode) => {
              toResolveUrl(vnode, 'href');
              return createElement(vnode);
            },

            img: (vnode) => {
              toResolveUrl(vnode, 'src');
              return createElement(vnode);
            },

            script: (vnode) => createScriptNode(vnode),

            style: (vnode) => {
              const text = vnode.children[0];
              if (text) {
                (text as VText).content = transformCssUrl(
                    baseUrl,
                    (text as VText).content,
                );
              }
              return createElement(vnode);
            },

            link: (vnode) => {
              if (isCssLink(vnode)) {
                const href = vnode.attributes.find(({ key }) => key === 'href');
                const resource = this.resources.link.find(
                    ({ opts }) => opts.url === href.value,
                );
                if (!resource) {
                  return createElement(vnode);
                }

                const { url, code } = resource.opts;
                const content = `\n/* ${createLinkNode(vnode)} */\n${code}`;

                if (resource.type !== 'css') {
                  warn(
                      `The media type of the current resource does not match. "${url}"`,
                  );
                  return null;
                }
                return url
                    ? createStyleNode(transformCssUrl(url, content))
                    : createStyleNode(content);
              } else if (isPrefetchJsLink(vnode)) {
                return createScriptNode(vnode);
              } else {
                return createElement(vnode);
              }
            },
          })
          .forEach((el) => {
            if (el) {
              rawAppendChild.call(container, el);
            }
          });
    } else {
      this.mockBody = document.createElement('div');
      this.mockBody.className = '__GarfishMockBody__';
    }
    this.container = container;
  }

  private async checkAndGetAppResult() {
    const {
      context,
      appInfo,
      mockBody,
      container,
      cjsModules,
      isHtmlMode,
      opts: { props, basename },
    } = this;
    let provider = cjsModules.exports && cjsModules.exports.provider;

    if (typeof provider === 'function') {
      const dom = isHtmlMode ? container : mockBody;
      provider = await provider({
        dom,
        basename,
        ...(props || {}),
        ...(appInfo.props || {}),
      });
    }

    if (!provider || typeof provider !== 'object') {
      warn(
          ` Invalid module content: ${appInfo.name}, you should return both render and destroy functions in provider function.`,
      );
    }

    // 如果有 customLoader，把 provide 交由用户自行处理
    const hookRes = await context.callHooks('customLoader', [
      provider,
      appInfo,
      basename,
    ]);

    if (hookRes) {
      const { mount, unmount } = hookRes() || {};
      if (typeof mount === 'function' && typeof unmount === 'function') {
        mount._custom = true;
        unmount._custom = true;
        provider.render = mount;
        provider.destroy = unmount;
      }
    }

    assert('render' in provider, '"render" is required in provider.');
    assert('destroy' in provider, '"destroy" is required in provider.');

    this.provider = provider;
    return provider;
  }
}
