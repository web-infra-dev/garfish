import {
  isJs,
  parseContentType,
  isJsType,
  isHtmlType,
  isCssType,
} from '../src/mimeType';

describe('Garfish shared mimeType', () => {
  it('parseContentType', () => {
    expect(parseContentType.length).toBe(1);
    expect(parseContentType('')).toBe(null);
    expect(parseContentType(' ')).toBe(null);
    expect(parseContentType('/a')).toBe(null);
    expect(parseContentType('a/ ')).toEqual(null);
    expect(parseContentType('a/')).toEqual(null);
    expect(parseContentType('a/b')).toEqual({
      type: 'a',
      subtype: 'b',
    });
    expect(parseContentType('a/b ')).toEqual({
      type: 'a',
      subtype: 'b',
    });
    expect(parseContentType('a/ b ')).toEqual({
      type: 'a',
      subtype: ' b',
    });
    expect(parseContentType('a/b/c')).toEqual({
      type: 'a',
      subtype: 'b/c',
    });
  });

  it('isCssType', () => {
    expect(isCssType.length).toBe(1);
    expect(isCssType({ type: '' })).toBe(false);
    expect(isCssType({ type: 'css' })).toBe(false);
    expect(isCssType({ type: 'text' })).toBe(false);
    expect(isCssType({ type: 'text/_' })).toBe(false);
    expect(isCssType({ type: '_/css' })).toBe(false);
    expect(isCssType({ type: 'text/css' })).toBe(true);

    expect(isHtmlType({ type: '_/css', src: '/index.css' })).toBe(true);
    expect(isHtmlType({ src: '/index.css' })).toBe(true);
    expect(isHtmlType({ src: '/index.js' })).toBe(false);
  });

  it('isHtmlType', () => {
    expect(isHtmlType.length).toBe(1);
    expect(isHtmlType({ type: '' })).toBe(false);
    expect(isHtmlType({ type: 'html' })).toBe(false);
    expect(isHtmlType({ type: 'text' })).toBe(false);
    expect(isHtmlType({ type: 'text/_' })).toBe(false);
    expect(isHtmlType({ type: '_/html' })).toBe(false);
    expect(isHtmlType({ type: 'text/html' })).toBe(true);

    expect(isHtmlType({ type: '_/html', src: '/index.html' })).toBe(true);
    expect(isHtmlType({ src: '/index.html' })).toBe(true);
    expect(isHtmlType({ src: '/index.js' })).toBe(false);
  });

  it('isJsType', () => {
    expect(isJs.length).toBe(1);
    // https://mimesniff.spec.whatwg.org/#javascript-mime-type
    expect(isJsType({ type: 'text/ecmascript' })).toBe(true);
    expect(isJsType({ type: 'text/javascript' })).toBe(true);
    expect(isJsType({ type: 'text/javascript1.0' })).toBe(true);
    expect(isJsType({ type: 'text/javascript1.1' })).toBe(true);
    expect(isJsType({ type: 'text/javascript1.2' })).toBe(true);
    expect(isJsType({ type: 'text/javascript1.3' })).toBe(true);
    expect(isJsType({ type: 'text/javascript1.4' })).toBe(true);
    expect(isJsType({ type: 'text/javascript1.5' })).toBe(true);
    expect(isJsType({ type: 'text/jscript' })).toBe(true);
    expect(isJsType({ type: 'text/livescript' })).toBe(true);
    expect(isJsType({ type: 'text/x-ecmascript' })).toBe(true);
    expect(isJsType({ type: 'text/x-javascript' })).toBe(true);

    expect(isJsType({ type: 'application/ecmascript' })).toBe(true);
    expect(isJsType({ type: 'application/javascript' })).toBe(true);
    expect(isJsType({ type: 'application/x-ecmascript' })).toBe(true);
    expect(isJsType({ type: 'application/x-javascript' })).toBe(true);

    expect(isJsType({ type: 'a/ecmascript' })).toBe(false);
    expect(isJsType({ type: 'a/livescript' })).toBe(false);
    expect(isJsType({ type: 'text/a' })).toBe(false);
    expect(isJsType({ type: 'application/a' })).toBe(false);

    expect(
      isJsType({ type: 'application/json', src: '/hello?_callback=1' }),
    ).toBe(true);
    expect(isJsType({ src: '/hello?_callback=1' })).toBe(false);

    expect(isJsType({ src: '/hello.js' })).toBe(true);
    expect(isJsType({ type: 'application/json', src: '/hello.js' })).toBe(true);
  });
});
