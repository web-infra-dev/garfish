import { StyleManager } from '../src/managers/style';

describe('Loader: style process', () => {
  it('adjust @import to be with url()', () => {
    const styleManager = new StyleManager(' @import   \'foo.css\' ; @import   "bar.css" ; ');

    styleManager.correctPath('https://google.com');
    // "@import" without url() is legal, adjust it to be more simple to corrent paths.
    expect(styleManager.styleCode).toContain('url("https://google.com/foo.css")');
    expect(styleManager.styleCode).toContain('url("https://google.com/bar.css")');
  });

  it('support external url with parentheses', () => {
    const styleManager = new StyleManager('.foo { background: url("/foo(1).png") }');
    styleManager.correctPath('https://google.com');
    // File names with parentheses are allowed.
    expect(styleManager.styleCode).toContain('url("https://google.com/foo(1).png")')
  });

  it('do not support external url with asymmetrical quotation marks', () => {
    const styleManager = new StyleManager('.foo { background: url("foo.png\') }');
    styleManager.correctPath('https://google.com');
    // Asymmetrical quotation marks lead to syntax error
    expect(styleManager.styleCode).not.toContain('url("https://google.com/foo(1).png")')
  });

  it('remove all @charset', () => {
    const styleManager = new StyleManager(' @charset  \'UTF-8\' ;  @charset "utf8"; ');
    styleManager.correctPath('https://google.com');
    // "@charset" is pointless for inline styles
    expect(styleManager.styleCode.trim()).toHaveLength(0);
  });
});
