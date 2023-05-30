import { __MockHead__ } from '@garfish/utils';
import { Sandbox } from '../src/sandbox';
import { StyleManager } from '@garfish/loader';
import { rebuildCSSRules } from '../src/dynamicNode';

describe('Sandbox: dynamic style', () => {
  let sandbox: Sandbox;

  const go = (code: string | (() => void)) => {
    if (typeof code === 'function') {
      code = `(${code})();`;
    }
    return `
      const sandbox = __debug_sandbox__;
      const Sandbox = sandbox.constructor;
      const nativeWindow = Sandbox.getNativeWindow();
      ${code}
    `;
  };

  // Mock style transformer
  const styleManagerProto = StyleManager.prototype;
  const originalTransformCode = styleManagerProto.transformCode;
  styleManagerProto.transformCode = function (code) {
    return originalTransformCode('.app ' + code);
  };

  beforeEach(() => {
    document.body.innerHTML = `<div id="root">123<div ${__MockHead__}></div></div>`;
    sandbox = new Sandbox({
      namespace: 'app',
      el: () => document.querySelector('#root'),
      baseUrl: 'http://test.app',
      modules: [
        () => ({
          recover() {},
          override: { go, jest, expect },
        }),
      ],
    });
  });

  it('set textContent', (done) => {
    sandbox.execScript(
      go(() => {
        const style = document.createElement('style');
        style.textContent = '.a { color: black; }';
        document.head.appendChild(style);
        expect([
          style.textContent,
          Array.from(style.sheet!.cssRules).map((x) => x.cssText),
        ]).toMatchSnapshot();
        done();
      }),
      { done },
    );
  });

  it('append text node', (done) => {
    sandbox.execScript(
      go(() => {
        const style = document.createElement('style');
        style.textContent = '.a { color: black; }';
        document.head.appendChild(style);
        style.appendChild(document.createTextNode('.b { color: white; }'));
        expect([
          style.textContent,
          Array.from(style.sheet!.cssRules).map((x) => x.cssText),
        ]).toMatchSnapshot();
        done();
      }),
      { done },
    );
  });

  it('insertRule', (done) => {
    sandbox.execScript(
      go(() => {
        const style = document.createElement('style');
        document.head.appendChild(style);
        style.sheet!.insertRule('.b { color: white; }');
        style.sheet!.insertRule('.a { color: black; }');
        style.sheet!.insertRule('.c { color: white; }', 2);
        expect(
          Array.from(style.sheet!.cssRules).map((x) => x.cssText),
        ).toMatchSnapshot();
        done();
      }),
      { done },
    );
  });

  const createStyleComponentElementWithRecord = () => {
    sandbox.execScript(
      go(() => {
        const styleComponentElement = document.createElement('style');
        document.head.appendChild(styleComponentElement);
        const cssRuleExample1 = '.test1 { color: red }';
        const cssRuleExample2 = '.test2 { color: red }';
        styleComponentElement.sheet!.insertRule(cssRuleExample1);
        styleComponentElement.sheet!.insertRule(cssRuleExample2);
        window._styleElement = styleComponentElement;
      }),
    );

    const style = sandbox.global!._styleElement as HTMLStyleElement;
    sandbox.dynamicStyleSheetElementSet.add(style);
    return style;
  };

  it('should record the css rules of styled-components correctly', () => {
    const styleComponentElement = createStyleComponentElementWithRecord();
    const data = sandbox.styledComponentCSSRulesMap.get(styleComponentElement);
    expect(data!.cssRuleList!.length).toEqual(2);
    expect((data!.cssRuleList![0] as CSSStyleRule).selectorText).toEqual(
      '.app .test2',
    );
    expect((data!.cssRuleList![1] as CSSStyleRule).selectorText).toEqual(
      '.app .test1',
    );
  });

  it('should rebuild the css rules of styled-components in the correct order', () => {
    const styleComponentElement = createStyleComponentElementWithRecord();

    Object.defineProperty(styleComponentElement, 'sheet', {
      writable: true,
      value: new CSSStyleSheet(),
    });
    const cssRules = styleComponentElement.sheet!.cssRules;
    expect(cssRules.length).toEqual(0);
    rebuildCSSRules(
      sandbox.dynamicStyleSheetElementSet,
      sandbox.styledComponentCSSRulesMap,
    );
    expect(cssRules.length).toEqual(2);
    expect((cssRules![0] as CSSStyleRule).selectorText).toEqual('.app .test2');
    expect((cssRules![1] as CSSStyleRule).selectorText).toEqual('.app .test1');
  });
});
