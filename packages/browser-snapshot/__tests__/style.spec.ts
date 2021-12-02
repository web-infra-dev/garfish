import { PatchStyle } from '../src/patchers/style';

const createStyleComponentElementWithRecord = () => {
  const styleComponentElement = document.createElement('style');
  document.head.appendChild(styleComponentElement);
  const cssRuleExample1 = '.test1 { color: red }';
  const cssRuleExample2 = '.test2 { color: red }';
  styleComponentElement.sheet?.insertRule(`${cssRuleExample1}`);
  styleComponentElement.sheet?.insertRule(`${cssRuleExample2}`);
  return styleComponentElement;
};

describe('test sandbox ', () => {
  it('dom sandbox', () => {
    document.head.innerHTML = '<style>body{color: "yellow";}</style>';

    expect(document.querySelector('head')).toMatchSnapshot();
    const sty = new PatchStyle();
    sty.activate();

    document.head.removeChild(document.head.firstChild!);
    const st = document.createElement('style');
    st.innerHTML = 'div{background: "red";}';
    document.head.appendChild(st);

    const link = document.createElement('link');
    link.href = 'www.baidu.com';
    document.head.append(link);

    sty.deactivate();

    expect(document.querySelector('head')).toMatchSnapshot();
    sty.activate();
    expect(document.querySelector('head')).toMatchSnapshot();
  });

  it('cssStyleSheet', () => {
    function expectIncludeCssRules(cssRules: CSSRuleList) {
      expect(cssRules.length).toEqual(2);
      expect((cssRules?.[0] as CSSStyleRule).selectorText).toEqual('.test2');
      expect((cssRules?.[1] as CSSStyleRule).selectorText).toEqual('.test1');
    }

    const sty = new PatchStyle();
    sty.activate();
    const styleComponentElement = createStyleComponentElementWithRecord();

    expectIncludeCssRules(styleComponentElement.sheet.cssRules);

    sty.deactivate();

    expect(styleComponentElement.sheet).toEqual(null);

    sty.activate();
    expectIncludeCssRules(styleComponentElement.sheet.cssRules);
  });
});
