import 'unfetch/polyfill';
import {
  warn,
  error,
  assert,
  VNode,
  VText,
  isVNode,
  isVText,
  isComment,
  isCssLink,
  isJs,
  isCss,
  isHtml,
  transformUrl,
  createElement,
  createTextNode,
  rawAppendChild,
  parseContentType,
} from '@garfish/utils';
import { Garfish } from '../garfish';
import { transformCode } from '../utils';
import { CREATE_APP } from '../eventFlags';
import { SnapshotApp } from './snapshotApp';
import { App, ResourceModules } from './app';
import { AppInfo, LoadAppOptions } from '../config';

let currentSize = 0;

// 如果超过了内存中缓存的
export function isOverCapacity(size: number) {
  return size > 1024 * 1024 * 30; // 30M
}

export interface HtmlResourceOpts {
  url: string;
  code: string;
  size: number;
}

export interface JsResourceOpts {
  url?: string;
  code: string;
  size: number;
  attributes: VNode['attributes'];
}

export interface CssResourceOpts {
  url?: string;
  code: string;
  size: number;
}

export class JsResource {
  type = 'js';
  opts: JsResourceOpts;
  constructor(opts: JsResourceOpts) {
    this.opts = opts;
  }
}

export class CssResource {
  type = 'css';
  opts: CssResourceOpts;
  constructor(opts: CssResourceOpts) {
    this.opts = opts;
  }
}

export class HtmlResource {
  type = 'html';
  opts: HtmlResourceOpts;
  ast: Array<VNode>;
  jss: Array<VNode>;
  links: Array<VNode>;
  styles: Array<VNode>;

  constructor(opts: HtmlResourceOpts) {
    this.opts = opts;
    this.ast = transformCode(opts.code);
    this.opts.code = '';

    const vnodes = this.queryVNodesByTagNames(['link', 'style', 'script']);
    this.jss = vnodes.script;
    this.links = vnodes.link;
    this.styles = vnodes.style;
  }

  private queryVNodesByTagNames(tagNames: Array<string>) {
    const res: Record<string, Array<VNode>> = {};
    for (const tagName of tagNames) {
      res[tagName] = [];
    }
    const traverse = (vnode: VNode | VText) => {
      if (vnode.type === 'element') {
        const { tagName, children } = vnode;
        if (tagNames.indexOf(tagName) > -1) {
          res[tagName].push(vnode);
        }
        children.forEach((vnode) => traverse(vnode));
      }
    };
    this.ast.forEach((vnode) => traverse(vnode));
    return res;
  }

  getVNodesByTagName(tagName: string) {
    if (tagName === 'link') return this.links;
    if (tagName === 'style') return this.styles;
    if (tagName === 'script') return this.jss;
    return this.queryVNodesByTagNames([tagName])[tagName];
  }

  renderToElement(
    cusRender: Record<string, (vnode: VNode) => Element | Comment>,
  ) {
    const els = [];
    const traverse = (vnode: VNode | VText) => {
      let el = null;
      if (isComment(vnode)) {
        // 过滤注释
      } else if (isVText(vnode)) {
        el = createTextNode(vnode as VText);
      } else if (isVNode(vnode)) {
        const { tagName, children } = vnode as VNode;
        if (cusRender && cusRender[tagName]) {
          el = cusRender[tagName](vnode as VNode);
        } else {
          el = createElement(vnode as VNode);
        }

        const nodeType = el && el.nodeType;
        if (nodeType !== 8 && nodeType !== 10) {
          for (const child of children) {
            const childEl = traverse(child);
            childEl && rawAppendChild.call(el, childEl);
          }
        }
      }
      return el;
    };

    this.ast.forEach((vnode) => {
      if (isVNode(vnode) && vnode.tagName !== '!doctype') {
        const el = traverse(vnode);
        el && els.push(el);
      }
    });
    return els;
  }
}

export class Loader {
  private readonly context: Garfish;
  private readonly caches: Record<
    string,
    HtmlResource | CssResource | JsResource
  >;
  private readonly loadings: Record<
    string,
    Promise<HtmlResource | CssResource | JsResource>
  >;

  constructor(context: Garfish) {
    assert(context, 'lack loader context.');
    this.context = context;
    this.caches = Object.create(null);
    this.loadings = Object.create(null);
  }

  private takeJsResources(manager: HtmlResource) {
    const reqestList = [];
    const baseUrl = manager.opts.url;
    const vnodes = manager.getVNodesByTagName('script');

    for (const { children, attributes } of vnodes) {
      // 过滤 esm, 暂不支持 esm
      const type = attributes.find(({ key }) => key === 'type');
      if (type?.value === 'module') {
        if (__DEV__) {
          const src = attributes.find(({ key }) => key === 'src');
          warn(`Does not support "esm" module script. ${src?.value || ''}`);
        }
        continue;
      }

      if (children.length > 0) {
        const code = (children[0] as VText).content;
        reqestList.push(
          new JsResource({
            code,
            url: null,
            size: null,
            attributes,
          }),
        );
      }
      if (attributes.length > 0) {
        let src, async, type;
        for (const { key, value } of attributes) {
          if (key === 'src') src = value;
          if (key === 'type') type = value;
          if (key === 'async') async = true;
        }
        if (src) {
          // js 资源需要存着 attrs，后面需要用到
          const setAttr = (res: JsResource) => {
            if (res.opts.attributes.length === 0) {
              res.opts.attributes = attributes;
            }
            return res;
          };

          // 转换为绝对路径
          src = transformUrl(baseUrl, src);

          if (async) {
            const content = () => this.load(src).then(setAttr);
            reqestList.push({ async, content });
          } else {
            reqestList.push(this.load(src).then(setAttr));
          }
        }
      }
    }
    return reqestList;
  }

  private takeLinkResources(manager: HtmlResource) {
    const reqestList = [];
    const baseUrl = manager.opts.url;
    const vnodes = manager.getVNodesByTagName('link');

    for (const vnode of vnodes) {
      if (isCssLink(vnode)) {
        const href = vnode.attributes.find(({ key }) => key === 'href');
        if (href?.value) {
          reqestList.push(this.load(transformUrl(baseUrl, href.value)));
        }
      }
    }
    return reqestList;
  }

  private createApp(
    appInfo: AppInfo,
    opts: LoadAppOptions,
    manager: HtmlResource | JsResource,
  ) {
    const run = (resources?: ResourceModules) => {
      const AppCtor = opts.sandbox.snapshot ? SnapshotApp : App;
      const app = new AppCtor(this.context, appInfo, opts, manager, resources);
      this.context.emit(CREATE_APP, app);
      return app;
    };

    if (manager.type !== 'html') {
      return run();
    }

    // 如果是 html, 就需要加载用到的资源
    const mjs = Promise.all(this.takeJsResources(manager as HtmlResource));
    const mlink = Promise.all(this.takeLinkResources(manager as HtmlResource));
    return Promise.all([mjs, mlink]).then(([js, link]) => run({ js, link }));
  }

  // 加载任意的资源，但是都是会转为 string
  load(url: string, config?: RequestInit) {
    assert(url && typeof url === 'string', 'Miss load url.');

    if (this.caches[url]) {
      return Promise.resolve(this.caches[url]);
    } else if (this.loadings[url]) {
      return this.loadings[url];
    } else {
      config = { mode: 'cors', ...config };

      this.loadings[url] = fetch(url, config)
        .then((res) => {
          // 响应码大于 400 的当做错误
          if (res.status >= 400) {
            error(`"${url}" load failed with status "${res.status}"`);
          }
          const type = res.headers.get('content-type');
          return res.text().then((code) => ({ code, type, res }));
        })
        .then(({ code, type, res }) => {
          let manager;
          const blob = new Blob([code]);
          const size = Number(blob.size);
          const ft = parseContentType(type);

          if (isJs(ft) || /\.js/.test(res.url)) {
            manager = new JsResource({ url, code, size, attributes: [] });
          } else if (isHtml(ft) || /\.html/.test(res.url)) {
            manager = new HtmlResource({ url, code, size });
          } else if (isCss(ft) || /\.css/.test(res.url)) {
            manager = new CssResource({ url, code, size });
          } else {
            error(`Invalid resource type "${type}", "${url}"`);
          }

          this.loadings[url] = null;
          currentSize += isNaN(size) ? 0 : size;
          if (!isOverCapacity(currentSize)) {
            this.caches[url] = manager;
          }
          return manager;
        });
      return this.loadings[url];
    }
  }

  // load app
  loadApp(appInfo: AppInfo, opts: LoadAppOptions): Promise<App | SnapshotApp> {
    assert(appInfo, 'lock appInfo');
    return this.load(appInfo.entry).then(
      (resManager: HtmlResource | JsResource) => {
        return this.createApp(appInfo, opts, resManager);
      },
    );
  }
}
