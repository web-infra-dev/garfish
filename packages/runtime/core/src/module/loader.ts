import { parse } from 'himalaya';
import {
  warn,
  error,
  assert,
  VText,
  isCssLink,
  isJs,
  isCss,
  isHtml,
  findProp,
  transformUrl,
  parseContentType,
} from '@garfish/utils';
import { App, ResourceModules } from './app';
import { AppInfo } from '../type';
import { CssResource, JsResource, HtmlResource } from './source';

let currentSize = 0;

// 如果超过了内存中缓存的
export function isOverCapacity(size: number) {
  return size > 1024 * 1024 * 30; // 30M
}

export class Loader {
  private forceCaches: Set<string>;
  private caches: Record<string, HtmlResource | CssResource | JsResource>;
  private loadings: Record<
    string,
    Promise<HtmlResource | CssResource | JsResource>
  >;

  // 允许自定义配置
  public requestConfig: RequestInit | ((url: string) => RequestInit) = {};

  constructor() {
    this.forceCaches = new Set();
    this.caches = Object.create(null);
    this.loadings = Object.create(null);
  }

  private takeJsResources(manager: HtmlResource) {
    const requestList = [];
    const baseUrl = manager.opts.url;
    const vnodes = manager.getVNodesByTagName('script');

    for (const vnode of vnodes) {
      const { children, attributes } = vnode;
      // 过滤 esm, 暂不支持 esm
      const type = findProp(vnode, 'type');
      if (type?.value === 'module') {
        if (__DEV__) {
          const src = findProp(vnode, 'src');
          warn(`"esm" module script is not supported. ${src?.value || ''}`);
        }
        continue;
      }

      // 指定了 src 属性的 script 元素标签内不应该再有嵌入的脚本
      let src, async;
      for (const { key, value } of attributes) {
        if (key === 'src') src = value;
        if (key === 'async') async = true;
      }

      if (src) {
        // js 资源需要存着 attrs，后面需要用到
        const setAttr = (res: JsResource) => {
          if (res.opts.attributes?.length === 0) {
            res.opts.attributes = attributes;
          }
          if (async) {
            res.async = true;
          }
          vnode.key = res.key;

          return res;
        };

        // 转换为绝对路径
        src = transformUrl(baseUrl, src);

        // if (async) {
        //   const content = () => this.load(src).then(setAttr);
        //   requestList.push({ async, content });
        // } else {
        //   requestList.push(this.load(src).then(setAttr));
        // }
        requestList.push(this.load(src).then(setAttr));
      } else if (children.length > 0) {
        const code = (children[0] as VText).content;
        const res = new JsResource({
          code,
          url: null,
          size: null,
          attributes,
        });

        vnode.key = res.key;
        requestList.push(res);
      }
    }
    return requestList;
  }

  private takeLinkResources(manager: HtmlResource) {
    const requestList = [];
    const baseUrl = manager.opts.url;
    const vnodes = manager.getVNodesByTagName('link');

    for (const vnode of vnodes) {
      if (isCssLink(vnode)) {
        const href = findProp(vnode, 'href');
        if (href?.value) {
          requestList.push(this.load(transformUrl(baseUrl, href.value)));
        }
      }
    }
    return requestList;
  }

  private createApp(
    appInfo: AppInfo,
    manager: HtmlResource,
    isHtmlMode: boolean,
  ) {
    const run = (resources: ResourceModules) => {
      const app = new App(
        appInfo,
        manager,
        resources,
        isHtmlMode,
      );
      return app;
    };

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
      const requestConfig =
        typeof this.requestConfig === 'function'
          ? this.requestConfig(url)
          : this.requestConfig;

      config = { mode: 'cors', ...config, ...requestConfig };

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
          if (!isOverCapacity(currentSize) || this.forceCaches.has(url)) {
            this.caches[url] = manager;
          }
          return manager;
        });
      return this.loadings[url];
    }
  }

  // load app
  loadApp(appInfo: AppInfo): Promise<App> {
    assert(appInfo?.entry, 'Miss appInfo or appInfo.entry');
    const resolveEntry = transformUrl(location.href, appInfo.entry);

    return this.load(resolveEntry).then(
      (resManager: HtmlResource | JsResource) => {
        const isHtmlMode = resManager.type === 'html';

        if (!isHtmlMode) {
          // HtmlResource 会自动补充 head、body
          const url = resManager.opts.url;
          const code = `<script src="${url}"></script>`;
          this.forceCaches.add(url);
          resManager = new HtmlResource({ url, code, size: 0 });
        }
        return this.createApp(
          appInfo,
          // @ts-ignore
          resManager,
          isHtmlMode,
        );
      },
    );
  }
}
