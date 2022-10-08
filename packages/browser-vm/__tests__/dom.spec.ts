import { Sandbox } from '../src/sandbox';
import { sandboxMap } from '../src/utils';
import {
  recordStyledComponentCSSRules,
  rebuildCSSRules,
} from '../src/dynamicNode';

// Garfish 使用 Proxy 对 dom 进行了劫持, 同时对调用 dom 的函数做了劫持, 修正 dom 节点的类型
// 对调用 dom 的相关方法进行测试
describe('Sandbox:Dom & Bom', () => {
  let sandbox: Sandbox;
  window.dispatchEvent = () => true;

  const go = (code: string) => {
    return `
      const sandbox = __debug_sandbox__;
      const Sandbox = sandbox.constructor;
      const nativeWindow = Sandbox.getNativeWindow();
      document.body.innerHTML = '<div id="root">123</div><div __garfishmockhead__></div>'
      ${code}
    `;
  };

  const create = (opts = {}) => {
    return new Sandbox({
      ...opts,
      namespace: 'app',
      el: () => document.createElement('div'),
      modules: [
        () => ({
          recover() {},
          override: {
            go,
            jest,
            expect,
          },
        }),
      ],
    });
  };

  beforeEach(() => {
    sandbox = create();
  });

  it('document method can be invoked correctly', () => {
    sandbox.execScript(
      go(`
        const root = document.getElementById('root');
        const div = document.createElement('div');
        const id = 'test';
        div.id = id;
        expect(root.appendChild(div)).toBeTruthy();
        const divSelect = document.getElementById(id)
        expect(divSelect.id).toBe(id)
      `),
    );
  });

  it('MutationObserver can be used correctly', () => {
    sandbox.execScript(
      go(`
        // const cb = jest.fn();
        // const root = document.getElementById('root');
        // const ob = new MutationObserver(cb);
        // ob.observe(root, {
        //   attributes: true
        // });
        // root.setAttribute('data-test', 1);
        // const ob2 = new MutationObserver(cb);
        // ob2.observe(document, {
        //   attributes: true
        // });
      `),
    );
  });

  it('Number.isInteger can be used correctly', () => {
    sandbox.execScript(
      go(`
        expect(Number.isInteger(5)).toBe(true);
        expect(window.Number.isInteger(5)).toBe(true);
      `),
    );
  });

  it('Static methods of Global Object can be used correctly', () => {
    sandbox.execScript(
      go(`
        expect(Number.isInteger(5)).toBe(true);
        expect(window.Number.isInteger(5)).toBe(true);
      `),
    );
  });

  // it('ownerDocument', () => {
  //   sandbox.execScript(
  //     go(`
  //       const div = document.createElement('div');
  //       expect(document.ownerDocument === null).toBe(true);
  //       expect(div.ownerDocument === document).toBe(true);
  //     `),
  //   );
  // });

  it('document.head', () => {
    sandbox.execScript(
      go(`
        const head = document.head;
        expect(head.tagName.toLowerCase()).toBe('div');
      `),
    );
  });

  it('Document and HTMLDocument', () => {
    sandbox.execScript(
      go(`
      expect(document instanceof HTMLDocument).toBe(true);
      expect(document instanceof Document).toBe(true);
      const documentCopy1 = new HTMLDocument();
      expect(documentCopy1 instanceof HTMLDocument).toBe(true);
      expect(documentCopy1 instanceof Document).toBe(true);
      const documentCopy2 = new Document();
      // jest has issue in Document instanceof proto
      // expect(documentCopy2 instanceof HTMLDocument).toBe(false);
      expect(documentCopy2 instanceof Document).toBe(true);
    `),
    );
  });

  it('MutationObserver callbacks can be canceled.', (next) => {
    sandboxMap.set(sandbox);
    sandbox.execScript(
      go(`
        let windowObserverTriggered = false;
        let sandboxObserverTriggered = false;
        const root = document.getElementById('root');
        const outer = document.createElement('div');
        outer.innerText = 'outer';
        root.appendChild(outer);
        const inner = document.createElement('div');
        inner.innerText = 'inner';
        outer.appendChild(inner);
        const windowObserver = new nativeWindow.MutationObserver(() => {
          windowObserverTriggered = true;
        });
        windowObserver.observe(outer, { attributes: true, childList: true, subtree: true });
        const sandboxObserver = new MutationObserver(() => {
          sandboxObserverTriggered = true;
        });
        sandboxObserver.observe(outer, { attributes: true, childList: true, subtree: true });
        // To trigger clear effects.
        sandbox.reset();
        Promise.resolve().then(() => {
          expect(windowObserverTriggered).toBe(true);
          expect(sandboxObserverTriggered).toBe(false);
          next();
        });
      `),
      { next },
    );
  });

  const createStyleComponentElementWithRecord = () => {
    const styleComponentElement = document.createElement('style');
    document.head.appendChild(styleComponentElement);
    const cssRuleExample1 = '.test1 { color: red }';
    const cssRuleExample2 = '.test2 { color: red }';
    styleComponentElement.sheet?.insertRule(`${cssRuleExample1}`);
    styleComponentElement.sheet?.insertRule(`${cssRuleExample2}`);
    sandbox.dynamicStyleSheetElementSet.add(styleComponentElement);

    recordStyledComponentCSSRules(
      sandbox.dynamicStyleSheetElementSet,
      sandbox.styledComponentCSSRulesMap,
    );
    return styleComponentElement;
  };

  it('should record the css rules of styled-components correctly', () => {
    const styleComponentElement = createStyleComponentElementWithRecord();
    const cssRules = sandbox.styledComponentCSSRulesMap.get(
      styleComponentElement,
    );
    expect(cssRules?.length).toEqual(2);
    expect((cssRules?.[0] as CSSStyleRule).selectorText).toEqual('.test2');
    expect((cssRules?.[1] as CSSStyleRule).selectorText).toEqual('.test1');
  });

  it('should rebuild the css rules of styled-components in the correct order', () => {
    const styleComponentElement = createStyleComponentElementWithRecord();

    Object.defineProperty(window.HTMLStyleElement.prototype, 'sheet', {
      writable: true,
      value: {},
    });
    // @ts-ignore
    styleComponentElement.sheet = new CSSStyleSheet();
    rebuildCSSRules(
      sandbox.dynamicStyleSheetElementSet,
      sandbox.styledComponentCSSRulesMap,
    );
    const cssRules = styleComponentElement.sheet.cssRules;
    expect(cssRules.length).toEqual(2);
    expect((cssRules?.[0] as CSSStyleRule).selectorText).toEqual('.test2');
    expect((cssRules?.[1] as CSSStyleRule).selectorText).toEqual('.test1');
  });
});
