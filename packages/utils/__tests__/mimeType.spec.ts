import {
  isJs,
  isCss,
  isHtml,
  parseContentType,
  isJsonp,
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

  it('isCss', () => {
    expect(isCss.length).toBe(1);
    expect(isCss({ type: '', subtype: '' })).toBe(false);
    expect(isCss({ type: '', subtype: 'css' })).toBe(false);
    expect(isCss({ type: 'text', subtype: '' })).toBe(false);
    expect(isCss({ type: 'text', subtype: '_' })).toBe(false);
    expect(isCss({ type: '_', subtype: 'css' })).toBe(false);
    expect(isCss({ type: 'text', subtype: 'css' })).toBe(true);
  });

  it('isHtml', () => {
    expect(isHtml.length).toBe(1);
    expect(isHtml({ type: '', subtype: '' })).toBe(false);
    expect(isHtml({ type: '', subtype: 'html' })).toBe(false);
    expect(isHtml({ type: 'text', subtype: '' })).toBe(false);
    expect(isHtml({ type: 'text', subtype: '_' })).toBe(false);
    expect(isHtml({ type: '_', subtype: 'html' })).toBe(false);
    expect(isHtml({ type: 'text', subtype: 'html' })).toBe(true);
  });

  it('isJs', () => {
    expect(isJs.length).toBe(1);
    // https://mimesniff.spec.whatwg.org/#javascript-mime-type
    expect(isJs({ type: 'text', subtype: 'ecmascript' })).toBe(true);
    expect(isJs({ type: 'text', subtype: 'javascript' })).toBe(true);
    expect(isJs({ type: 'text', subtype: 'javascript1.0' })).toBe(true);
    expect(isJs({ type: 'text', subtype: 'javascript1.1' })).toBe(true);
    expect(isJs({ type: 'text', subtype: 'javascript1.2' })).toBe(true);
    expect(isJs({ type: 'text', subtype: 'javascript1.3' })).toBe(true);
    expect(isJs({ type: 'text', subtype: 'javascript1.4' })).toBe(true);
    expect(isJs({ type: 'text', subtype: 'javascript1.5' })).toBe(true);
    expect(isJs({ type: 'text', subtype: 'jscript' })).toBe(true);
    expect(isJs({ type: 'text', subtype: 'livescript' })).toBe(true);
    expect(isJs({ type: 'text', subtype: 'x-ecmascript' })).toBe(true);
    expect(isJs({ type: 'text', subtype: 'x-javascript' })).toBe(true);

    expect(isJs({ type: 'application', subtype: 'ecmascript' })).toBe(true);
    expect(isJs({ type: 'application', subtype: 'javascript' })).toBe(true);
    expect(isJs({ type: 'application', subtype: 'x-ecmascript' })).toBe(true);
    expect(isJs({ type: 'application', subtype: 'x-javascript' })).toBe(true);

    expect(isJs({ type: 'a', subtype: 'ecmascript' })).toBe(false);
    expect(isJs({ type: 'a', subtype: 'livescript' })).toBe(false);
    expect(isJs({ type: 'text', subtype: 'a' })).toBe(false);
    expect(isJs({ type: 'application', subtype: 'a' })).toBe(false);
  });
});
