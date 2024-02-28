import type { StyleManager, JavaScriptManager } from '@garfish/loader';
import {
  def,
  warn,
  DOMApis,
  makeMap,
  isJsType,
  isCssType,
  safeWrapper,
  findTarget,
  __MockBody__,
  __MockHead__,
  transformUrl,
  sourceListTags,
  __REMOVE_NODE__,
} from '@garfish/utils';
import { Sandbox } from '../sandbox';
import { rootElm, LockQueue } from '../utils';
import { StyledComponentCSSRulesData } from '../types';

const isInsertMethod = makeMap(['insertBefore', 'insertAdjacentElement']);

export const rawElementMethods = Object.create(null);

export class DynamicNodeProcessor {
  private el: any; // any Element
  private tagName: string;
  private sandbox: Sandbox;
  private DOMApis: DOMApis;
  private methodName: string;
  static linkLock: LockQueue = new LockQueue();
  private rootElement: Element | ShadowRoot | Document;
  private nativeAppend = rawElementMethods['appendChild'];
  private nativeRemove = rawElementMethods['removeChild'];

  constructor(el, sandbox, methodName) {
    this.el = el;
    this.sandbox = sandbox;
    this.methodName = methodName;
    this.rootElement = rootElm(sandbox) || document;
    this.DOMApis = new DOMApis(sandbox.global.document);
    this.tagName = el.tagName ? el.tagName.toLowerCase() : '';
  }

  private is(tag: string) {
    return this.tagName === tag;
  }

  private fixResourceNodeUrl(el: any) {
    const baseUrl = this.sandbox.options.baseUrl;
    if (baseUrl) {
      const src = el.getAttribute('src');
      const href = el.getAttribute('href');
      if (this.sandbox.options.fixStaticResourceBaseUrl) {
        src && (el.src = transformUrl(baseUrl, src));
        href && (el.href = transformUrl(baseUrl, href));
      }

      const url = el.src || el.href;

      if (url && this.sandbox.options.addSourceList) {
        this.sandbox.options.addSourceList({
          tagName: el.tagName,
          url,
        });
      }
    }
  }

  // Put it in the next macro task to ensure that the current synchronization script is executed
  private dispatchEvent(type: string, errInfo?: ErrorEventInit) {
    Promise.resolve().then(() => {
      const isError = type === 'error';
      let event: Event & { __byGarfish__?: boolean };

      if (isError && errInfo) {
        event = new ErrorEvent(type, {
          ...errInfo,
          message: errInfo.error?.message,
        });
      } else {
        event = new Event(type);
      }
      event.__byGarfish__ = true;
      Object.defineProperty(event, 'target', { value: this.el });
      this.el.dispatchEvent(event);
      isError && window.dispatchEvent(event);
    });
  }

  // Load dynamic link node
  private addDynamicLinkNode(callback: (styleNode: HTMLStyleElement) => void) {
    const { href, type } = this.el;
    if (!type || isCssType({ src: href, type })) {
      if (href) {
        const { baseUrl, namespace, styleScopeId } = this.sandbox.options;
        const fetchUrl = baseUrl ? transformUrl(baseUrl, href) : href;
        // add lock to make sure render link node in order
        const lockId = DynamicNodeProcessor.linkLock.genId();
        this.sandbox.loader
          .load<StyleManager>({
            scope: namespace,
            url: fetchUrl,
            defaultContentType: type,
          })
          .then(async ({ resourceManager: styleManager }) => {
            await DynamicNodeProcessor.linkLock.wait(lockId);

            if (styleManager) {
              styleManager.correctPath();
              if (styleScopeId) {
                styleManager.setScope({
                  appName: namespace,
                  rootElId: styleScopeId(),
                });
              }
              callback(styleManager.renderAsStyleElement());
            } else {
              warn(
                `Invalid resource type "${type}", "${href}" can't generate styleManager`,
              );
            }
            this.dispatchEvent('load');
            DynamicNodeProcessor.linkLock.release(lockId);
          })
          .catch((e) => {
            DynamicNodeProcessor.linkLock.release(lockId);
            __DEV__ && warn(e);
            this.dispatchEvent('error', {
              error: e,
              filename: fetchUrl,
            });
          });
      }
    } else {
      if (__DEV__) {
        warn(`Invalid resource type "${type}", "${href}"`);
      }
    }
    // To ensure the processing node to normal has been removed
    const linkCommentNode = this.DOMApis.createLinkCommentNode(href) as Comment;
    this.el[__REMOVE_NODE__] = () =>
      this.DOMApis.removeElement(linkCommentNode);
    return linkCommentNode;
  }

  // Load dynamic js script
  private addDynamicScriptNode() {
    const { src, type, crossOrigin } = this.el;
    const isModule = type === 'module';
    const code = this.el.textContent || this.el.text || '';

    if (!type || isJsType({ src, type })) {
      // The "src" higher priority
      const { baseUrl, namespace } = this.sandbox.options;
      if (src) {
        const fetchUrl = baseUrl ? transformUrl(baseUrl, src) : src;
        this.sandbox.loader
          .load<JavaScriptManager>({
            scope: namespace,
            url: fetchUrl,
            crossOrigin,
            defaultContentType: type,
          })
          .then(
            (manager) => {
              if (manager.resourceManager) {
                const {
                  resourceManager: { url, scriptCode },
                } = manager;
                // It is necessary to ensure that the code execution error cannot trigger the `el.onerror` event
                this.sandbox.execScript(scriptCode, {}, url, {
                  isModule,
                  defer: false,
                  async: false,
                  noEntry: true,
                  originScript: this.el,
                });
              } else {
                warn(
                  `Invalid resource type "${type}", "${src}" can't generate scriptManager`,
                );
              }
              this.dispatchEvent('load');
            },
            (e) => {
              __DEV__ && warn(e);
              this.dispatchEvent('error', {
                error: e,
                filename: fetchUrl,
              });
            },
          );
      } else if (code) {
        this.sandbox.execScript(code, {}, baseUrl, {
          noEntry: true,
          originScript: this.el,
        });
      }
      // To ensure the processing node to normal has been removed
      const scriptCommentNode = this.DOMApis.createScriptCommentNode({
        src,
        code,
      });
      this.el[__REMOVE_NODE__] = () =>
        this.DOMApis.removeElement(scriptCommentNode);
      return scriptCommentNode;
    }
    return this.el;
  }

  // When append an empty link node and then add href attribute
  private monitorChangesOfLinkNode() {
    if (this.el.modifyFlag) return;

    const mutator = new MutationObserver((mutations) => {
      if (this.el.modifyFlag) return;
      for (const { type, attributeName } of mutations) {
        if (type === 'attributes') {
          if (attributeName === 'rel' || attributeName === 'stylesheet') {
            if (this.el.modifyFlag) return;
            if (this.el.rel === 'stylesheet' && this.el.href) {
              this.el.disabled = this.el.modifyFlag = true;
              const commentNode = this.addDynamicLinkNode((styleNode) => {
                commentNode.parentNode?.replaceChild(styleNode, commentNode);
              });
              this.el.parentNode?.replaceChild(commentNode, this.el);
            }
          }
        }
      }
    });
    // https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/disconnect
    mutator.observe(this.el, { attributes: true });
  }

  private monitorChangesOfStyle() {
    const { baseUrl, namespace, styleScopeId } = this.sandbox.options;
    const rootElId = styleScopeId?.();

    const modifyStyleCode = (styleCode: string | null) => {
      if (styleCode) {
        const manager = new this.sandbox.loader.StyleManager(styleCode);
        manager.correctPath(baseUrl);
        if (rootElId) {
          manager.setScope({
            rootElId,
            appName: namespace,
          });
        }
        styleCode = manager.transformCode(styleCode);
      }
      return styleCode;
    };

    const mutator = new MutationObserver((mutations) => {
      for (const { type, addedNodes } of mutations) {
        if (type === 'childList') {
          if (addedNodes[0]?.textContent) {
            addedNodes[0].textContent = modifyStyleCode(
              addedNodes[0].textContent,
            );
          }
        }
      }
    });
    mutator.observe(this.el, { childList: true });

    // Handle `sheet.cssRules` (styled-components)
    let fakeSheet: any = null;
    Reflect.defineProperty(this.el, 'sheet', {
      get: () => {
        // styled-components only get the `sheet` once, and keep the first
        // instance in their state. But the `sheet` will be actually replaced
        // with another instance after remount.
        // To make insertRule() after remount possible, we return a fake sheet
        // here and passthrough operations to the latest real `sheet`.
        if (!fakeSheet) {
          fakeSheet = this.createFakeSheet(modifyStyleCode);
        }
        return fakeSheet;
      },
      configurable: true,
    });
  }

  private findParentNodeInApp(parentNode: Element, defaultInsert?: string) {
    if (parentNode === document.body) {
      return findTarget(this.rootElement, [
        'body',
        `div[${__MockBody__}]`,
      ]) as Element;
    } else if (parentNode === document.head) {
      return findTarget(this.rootElement, [
        'head',
        `div[${__MockHead__}]`,
      ]) as Element;
    }

    // Add the location of the destination node is not a container to the container of the application
    // Has not been added to the container, or cannot be searched through document in shadow dom
    if (
      this.rootElement.contains(parentNode) ||
      !document.contains(parentNode)
    ) {
      return parentNode;
    }

    if (defaultInsert === 'head') {
      return findTarget(this.rootElement, [
        'head',
        `div[${__MockHead__}]`,
      ]) as Element;
    } else if (defaultInsert === 'body') {
      return findTarget(this.rootElement, [
        'body',
        `div[${__MockBody__}]`,
      ]) as Element;
    }
    return parentNode;
  }

  append(context: Element, args: IArguments, originProcess: Function) {
    let convertedNode;
    let parentNode = context;
    const { baseUrl, namespace, styleScopeId } = this.sandbox.options;

    // Deal with some static resource nodes
    if (sourceListTags.includes(this.tagName)) {
      this.fixResourceNodeUrl(this.el);
    }

    // Add dynamic script node by loader
    if (
      this.is('script') &&
      this.el?.getAttribute('type') !== 'application/json'
    ) {
      parentNode = this.findParentNodeInApp(context, 'body');
      convertedNode = this.addDynamicScriptNode();
    }
    // The style node needs to be placed in the sandbox root container
    else if (this.is('style')) {
      parentNode = this.findParentNodeInApp(context, 'head');
      // We take it from the loader, avoid having multiple manager constructors
      const manager = new this.sandbox.loader.StyleManager(this.el.textContent);
      manager.correctPath(baseUrl);
      if (styleScopeId) {
        manager.setScope({
          appName: namespace,
          rootElId: styleScopeId(),
        });
      }
      this.el.textContent = manager.transformCode(manager.styleCode);
      convertedNode = this.el;
      this.sandbox.dynamicStyleSheetElementSet.add(this.el);
      this.monitorChangesOfStyle();
    }
    // The link node of the request css needs to be changed to style node
    else if (this.is('link')) {
      parentNode = this.findParentNodeInApp(context, 'head');
      if (this.el.rel === 'stylesheet' && this.el.href) {
        convertedNode = this.addDynamicLinkNode((styleNode) => {
          this.nativeAppend.call(parentNode, styleNode);
        });
      } else {
        convertedNode = this.el;
        this.monitorChangesOfLinkNode();
      }
    }

    // Collect nodes that escape the container node
    if (
      !this.rootElement.contains(parentNode) &&
      document.contains(parentNode)
    ) {
      if (parentNode !== this.rootElement) {
        this.sandbox.deferClearEffects.add(() => {
          this.DOMApis.removeElement(this.el);
          return this.el;
        });
      }
    }

    // fix innerHTML dom iframe、img src
    if (this.el && this.el.querySelectorAll) {
      const needFixDom = this.el.querySelectorAll(
        'iframe,img,video,link,script,audio,style',
      );
      if (needFixDom.length > 0) {
        needFixDom.forEach((dom) => {
          safeWrapper(() => this.fixResourceNodeUrl(dom));
        });
      }
    }

    // Fix the bug of react hmr
    if (this.is('iframe') && typeof this.el.onload === 'function') {
      const { el, sandbox } = this;
      const originOnload = el.onload;
      el.onload = function () {
        safeWrapper(() => def(el.contentWindow, 'parent', sandbox.global));
        return originOnload.apply(this, arguments);
      };
    }

    if (convertedNode) {
      // If it is "insertBefore" or "insertAdjacentElement" method, no need to rewrite when added to the container
      if (
        isInsertMethod(this.methodName) &&
        this.rootElement.contains(context) &&
        args[1]?.parentNode === context
      ) {
        return originProcess();
      }

      // Emit sandbox `appendNode` event
      this.sandbox.hooks.lifecycle.appendNode.emit(
        parentNode,
        this.el,
        convertedNode,
        this.tagName,
      );
      return this.nativeAppend.call(parentNode, convertedNode);
    }
    return originProcess();
  }

  removeChild(context: Element, originProcess: Function) {
    // remove comment node and return the real node
    if (typeof this.el[__REMOVE_NODE__] === 'function') {
      this.el[__REMOVE_NODE__]();
      return this.el;
    }

    if (this.is('style') || this.is('link') || this.is('script')) {
      const parentNode = this.findParentNodeInApp(
        context,
        this.is('script') ? 'body' : 'head',
      );

      if (this.el.parentNode === parentNode) {
        if (this.sandbox.dynamicStyleSheetElementSet.has(this.el)) {
          this.sandbox.dynamicStyleSheetElementSet.delete(this.el);
        }
        return this.nativeRemove.call(parentNode, this.el);
      }
    }
    return originProcess();
  }

  private getRealSheet() {
    return Reflect.get(HTMLStyleElement.prototype, 'sheet', this.el);
  }

  private createFakeSheet(
    styleTransformer: (css: string | null) => string | null,
  ) {
    const processor = this;
    const rulesData: StyledComponentCSSRulesData = [];
    this.sandbox.styledComponentCSSRulesMap.set(this.el, rulesData);

    const fakeSheet = {
      get cssRules() {
        const realSheet = processor.getRealSheet();
        return realSheet?.cssRules ?? [];
      },
      insertRule(rule: string, index?: number) {
        const realSheet = processor.getRealSheet();
        const transformed = styleTransformer(rule)!;
        if (realSheet) {
          realSheet.insertRule(transformed, index);
        }
        rulesData.splice(index || 0, 0, transformed);
        return index || 0;
      },
      deleteRule(index: number) {
        const realSheet = processor.getRealSheet();
        if (realSheet) {
          realSheet.deleteRule(index);
        }
        rulesData.splice(index, 1);
      },
    };
    return fakeSheet;
  }
}
