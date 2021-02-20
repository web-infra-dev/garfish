import { Garfish } from '../../src/garfish';
import {
  isAsyncError,
  createGarfish,
  mockHtmlEntry,
  createHtmlManager,
} from '../testUtils';
import {
  Loader,
  JsResource,
  CssResource,
  HtmlResource,
} from '../../src/module/loader';

describe('Garfish loader', () => {
  let garfish: Garfish;
  let appWraper: HTMLDivElement;

  beforeEach(() => {
    appWraper = document.createElement('div');
    garfish = createGarfish({
      domGetter: () => appWraper,
    });
  });

  it('JsResource', () => {
    const opts = {
      url: '',
      code: '',
      size: 0,
      attributes: [],
    };
    const manager = new JsResource(opts);

    expect(manager.type).toBe('js');
    expect(manager.key !== '').toBe(true);
    expect(typeof manager.key).toBe('string');
    expect(manager.opts).toEqual(opts);
  });

  it('CssResource [1]', () => {
    const opts = {
      size: 0,
      url: 'https://a',
      code: 'url("./b")',
    };
    const manager = new CssResource(opts);

    expect(manager.type).toBe('css');
    expect(manager.opts).toMatchObject(opts);
    expect(manager.opts.code).toBe('url("https://a/b")');
  });

  it('CssResource [2]', () => {
    const opts = {
      size: 0,
      url: '',
      code: 'url("./b")',
    };
    const manager = new CssResource(opts);

    expect(manager.type).toBe('css');
    expect(manager.opts).toMatchObject(opts);
    expect(manager.opts.code).toBe('url("./b")');
  });

  it('HtmlResource', () => {
    const tagCount = 2;
    const opts = {
      size: 0,
      url: '',
      code: ['link', 'style', 'script'].reduce((str, tag) => {
        return str + `<${tag}></${tag}>`.repeat(tagCount);
      }, ''),
    };
    const manager = new HtmlResource(opts);

    expect(manager.type).toBe('html');
    expect(manager.opts).toMatchObject(opts);
    expect(manager.opts.code).toBe('');
    expect(typeof manager.ast).toBe('object');
    expect(manager.jss.length).toBe(tagCount);
    expect(manager.links.length).toBe(tagCount);
    expect(manager.styles.length).toBe(tagCount);
  });

  it('HtmlResource.getVNodesByTagName [1]', () => {
    const manager = createHtmlManager(HtmlResource);
    const spy = jest.spyOn(manager as any, 'queryVNodesByTagNames');
    expect(manager.getVNodesByTagName.length).toBe(1);

    const ls = manager.getVNodesByTagName('link');
    const ss = manager.getVNodesByTagName('style');
    const jss = manager.getVNodesByTagName('script');

    expect(ls.length).toBe(2);
    expect(ss.length).toBe(0);
    expect(jss.length).toBe(0);
    expect(spy.mock.calls.length).toBe(0);
    spy.mockRestore();
  });

  it('HtmlResource.getVNodesByTagName [2]', () => {
    const manager = createHtmlManager(HtmlResource);

    const a = manager.getVNodesByTagName('a');
    const b = manager.getVNodesByTagName('b');
    const div = manager.getVNodesByTagName('div');

    expect(a.length).toBe(1);
    expect(b.length).toBe(1);
    expect(div.length).toBe(2);
  });

  it('HtmlResource.renderElements', () => {
    const manager = createHtmlManager(HtmlResource);
    const parent = document.createElement('div');

    expect(parent.children.length).toBe(0);
    expect(manager.renderElements.length).toBe(2);
    const els = manager.renderElements(
      {
        a() {
          // 在创建 dom 树时应该提前 append 到 parentEl 中
          // 这样保证同步渲染的 script 代码能够获取到准确的 dom 信息
          expect(parent.children.length > 0).toBe(true);
          return null;
        },
      },
      parent,
    );
    expect(Array.isArray(els)).toBe(true);
    els.forEach((el) => {
      expect(el.parentNode === parent).toBe(true);
    });
  });

  it('Loader.load', async () => {
    expect(() => new (Loader as any)()).toThrow();
    const spyFetch = jest.spyOn(window, 'fetch');
    const loader = new Loader(garfish);
    expect(loader.load.length).toBe(2);

    const manager = await loader.load(mockHtmlEntry, {
      method: 'GET',
    });

    expect(manager.type).toBe('html');
    expect(spyFetch.mock.calls.length).toBe(1);
    expect(spyFetch.mock.calls[0].length).toBe(2);
    expect(spyFetch.mock.calls[0][0]).toBe(mockHtmlEntry);
    expect(spyFetch.mock.calls[0][1]).toMatchObject({
      mode: 'cors', // 默认加上了 cors
      method: 'GET',
    });

    spyFetch.mockRestore();
  });

  it('Loader.load [error]', async () => {
    const loader = new Loader(garfish);
    const res1 = await isAsyncError(
      () => loader.load('http://localhost:3333/error'),
      'load failed with status',
    );
    const res2 = await isAsyncError(() =>
      loader.load('http://localhost:3333/other'),
    );
    expect(res1).toBe(true); // 400
    expect(res2).toBe(true); // mimeType
  });

  it('Loader.load [no cache]', async () => {
    const loader = new Loader(garfish);
    const request1 = await loader.load(mockHtmlEntry);
    const request2 = await loader.load(mockHtmlEntry);

    expect(request1 === request2).toBe(true);
    expect(request1.type).toBe('html');
  });

  it('Loader.load [cache]', async () => {
    const loader = new Loader(garfish);
    let request1: any = loader.load(mockHtmlEntry);
    let request2: any = loader.load(mockHtmlEntry);

    expect(request1 === request2).toBe(true);

    request1 = await request1;
    request2 = await request2;
    expect(request1 === request2).toBe(true);
    expect(request1.type).toBe('html');
  });

  it('Loader.loadApp', async () => {
    const appInfo = {
      name: 'app',
      entry: mockHtmlEntry,
    };
    const loadOptions = {
      hooks: {},
      sandbox: {},
    };
    const loader = new Loader(garfish);
    const app = await loader.loadApp(appInfo, loadOptions);

    expect(app.name).toBe('app');
    expect(app.isSnapshotSandbox()).toBe(false);
    expect(app.options === loadOptions).toBe(true);
  });

  it('Loader.takeLinkResources', async () => {
    const loader = new Loader(garfish);
    const manager = createHtmlManager(HtmlResource);
    const ls = (loader as any).takeLinkResources(manager);

    expect(Array.isArray(ls)).toBe(true);
    expect(ls.length).toBe(1); // 过滤掉了一个空的 link 标签
    expect(typeof ls[0].then).toBe('function'); // promise

    const cssManager = await ls[0];
    expect(cssManager.type).toBe('css');
    expect(cssManager.opts.url.includes('http')).toBe(true);
  });

  it('Loader.takeJsResources', async () => {
    const loader = new Loader(garfish);
    const manager = new HtmlResource({
      size: 0,
      url: mockHtmlEntry,
      code: `
        <script>var a = 1;</script>
        <script src="./index.js"></script>
        <script src="./index.js" async></script>
        <script type="module"></script>
      `,
    });
    const ls = (loader as any).takeJsResources(manager);

    expect(Array.isArray(ls)).toBe(true);
    expect(ls.length).toBe(3);
    expect(typeof ls[1].then).toBe('function');
    expect(ls[2].async).toBe(true);

    const res1 = await ls[1];
    const res2 = await ls[2].content();

    expect(ls[0] instanceof JsResource).toBe(true);
    expect(res1 instanceof JsResource).toBe(true);
    expect(res2 instanceof JsResource).toBe(true);

    expect(ls[0].opts.code).toBe('var a = 1;');
    expect(res1.opts.code.length > 0).toBe(true);
    expect(res2.opts.code.length > 0).toBe(true);
    expect(res1.opts.code === res2.opts.code).toBe(true);
  });

  // 如果不需要做自动降级的话，这个案例可以删掉
  it('Automatic downgrade sandbox', async () => {
    const nativeProxy = window.Proxy;
    delete window.Proxy;
    const appInfo = {
      name: 'app',
      entry: mockHtmlEntry,
    };
    const loadOptions = {
      hooks: {},
      sandbox: {},
    };
    const loader = new Loader(garfish);
    const app = await loader.loadApp(appInfo, loadOptions);

    expect(app.name).toBe('app');
    expect(app.isSnapshotSandbox()).toBe(true);
    expect(app.options === loadOptions).toBe(true);
    window.Proxy = nativeProxy;
  });
});
