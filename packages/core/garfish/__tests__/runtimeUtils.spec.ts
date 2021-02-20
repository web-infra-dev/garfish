import {
  getRenderNode,
  transformCode,
  createAppContainer,
  __GARFISH_FLAG__,
} from '../src/utils';

describe('Garfish runtimeUtils', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('__GARFISH_FLAG__', () => {
    expect(typeof __GARFISH_FLAG__).toBe('symbol');
    expect(String(__GARFISH_FLAG__).includes('__GARFISH_FLAG__')).toBe(true);
  });

  it('getRenderNode', () => {
    expect(getRenderNode.length).toBe(1);
    expect(() => getRenderNode('')).toThrow(); // 没有选中元素
    expect(() => getRenderNode(null)).toThrow();
    expect(() => getRenderNode(undefined)).toThrow();
    expect(() => getRenderNode(false as any)).toThrow();

    expect(() => getRenderNode(() => '' as any)).toThrow();
    expect(() => getRenderNode(() => null)).toThrow();
    expect(() => getRenderNode(() => undefined)).toThrow();
    expect(() => getRenderNode(() => false as any)).toThrow();

    expect(getRenderNode(1 as any)).toBe(1);
    expect(getRenderNode(() => 'resultValue' as any)).toBe('resultValue');

    const spy = jest.spyOn(document, 'querySelector');
    expect(() => getRenderNode('#app')).toThrowError(
      /Invalid domGetter: #app/g,
    );
    expect(spy.mock.calls.length).toBe(1);
    expect(spy.mock.calls[0][0]).toBe('#app');

    spy.mockRestore();
  });

  it('createAppContainer', () => {
    expect(createAppContainer.length).toBe(2);
    const fn1 = () => {
      const { htmlNode, appContainer } = createAppContainer('', false);
      expect(htmlNode.tagName.toLowerCase()).toBe('div');
      expect(appContainer.tagName.toLowerCase()).toBe('div');
      expect(appContainer.id).toMatch(/garfish_app_for_unknow_/g);
    };
    const fn2 = () => {
      const { htmlNode, appContainer } = createAppContainer('app', false);
      expect(htmlNode.tagName.toLowerCase()).toBe('div');
      expect(appContainer.tagName.toLowerCase()).toBe('div');
      expect(appContainer.id).toMatch(/garfish_app_for_app_/g);
    };
    fn1();
    fn2();
  });

  it('createAppContainer [html mode]', (done) => {
    const { htmlNode, appContainer } = createAppContainer('', false);
    expect(htmlNode.tagName.toLowerCase()).toBe('div');
    expect(appContainer.tagName.toLowerCase()).toBe('div');
    expect(appContainer.id).toMatch(/garfish_app_for_unknow_/g);

    expect(htmlNode.getAttribute('style')).toBe(null);
    expect(document.body.getAttribute('style')).toBe(null);

    htmlNode.setAttribute('style', 'color: #000');
    expect(htmlNode.getAttribute('style')).toBe('color: #000');
    setTimeout(() => {
      expect(document.body.getAttribute('style')).toBe(null);
      done();
    });
  });

  it('createAppContainer [strictIsolation]', (done) => {
    jest.mock('../src/dispatchEvents', () => {
      return {
        __esModule: true,
        dispatchEvents(root) {
          expect(arguments.length).toBe(1);
          expect(root.nodeType).toBe(11);
          expect(root.mode).toBe('open');
          setTimeout(() => {
            expect(root === htmlNode.parentNode).toBe(true);
            done();
          });
        },
      };
    });
    const { createAppContainer } = require('../src/utils');
    const { htmlNode, appContainer } = createAppContainer('', true, true);

    expect(htmlNode.tagName.toLowerCase()).toBe('html');
    expect(appContainer.tagName.toLowerCase()).toBe('div');
    expect(appContainer.id).toMatch(/garfish_app_for_unknow_/g);
    expect(htmlNode.parentNode.nodeType).toBe(11);
    expect(htmlNode.parentNode.mode).toBe('open');
  });

  it('createAppContainer [asyncNodeAttribute]', (done) => {
    const { htmlNode } = createAppContainer('', true);
    expect(htmlNode.getAttribute('style')).toBe(null);
    expect(document.body.getAttribute('style')).toBe(null);

    htmlNode.setAttribute('style', 'color: #000');
    expect(htmlNode.getAttribute('style')).toBe('color: #000');
    setTimeout(() => {
      expect(document.body.getAttribute('style')).toBe('color: #000');
      done();
    });
  });

  it('transformCode', () => {
    expect(transformCode.length).toBe(1);

    const html = transformCode(`
      <div>
        content
        </div>
        <a href=//xx.html />
      </div>
    `).trim();

    expect(html.includes('content')).toBe(true);
    expect(html.includes('<head>')).toBe(true);
    expect(html.includes('</head>')).toBe(true);
    expect(html.includes('<body>')).toBe(true);
    expect(html.includes('</body>')).toBe(true);
    expect(html.includes('<div>')).toBe(true);
    expect(html.includes('</div>')).toBe(true);
    expect(html.includes('<a href="//xx.html">')).toBe(true);
    expect(html.includes('</a>')).toBe(true);
  });
});
