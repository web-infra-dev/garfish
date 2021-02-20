import {
  isSVG,
  isVText,
  isVNode,
  isComment,
  isCssLink,
  isAbsolute,
  isPrefetchJsLink,
  applyAttributes,
  removeElement,
  createElement,
  createLinkNode,
  createTextNode,
  createStyleNode,
  createScriptNode,
  SVG_TAGS,
  findProp,
  transformUrl,
  transformCssUrl,
} from '../src/domApis';

describe('Garfish shared domApi', () => {
  it('isSVG', () => {
    const tags = SVG_TAGS.split(',');
    tags.forEach((tag) => expect(isSVG(tag)).toBe(true));
    tags.forEach((tag) => expect(isSVG(`_${tag}`)).toBe(undefined));
  });

  it('isVText', () => {
    expect(!!isVText(null)).toBe(false);
    expect(!!(isVText as any)()).toBe(false);
    expect(!!isVText('' as any)).toBe(false);
    expect(!!isVText({ type: 'element' } as any)).toBe(false);
    expect(!!isVText({ type: 'comment' } as any)).toBe(false);
    expect(!!isVText({ type: 'text' } as any)).toBe(true);
  });

  it('isVNode', () => {
    expect(!!isVNode(null)).toBe(false);
    expect(!!(isVNode as any)()).toBe(false);
    expect(!!isVNode('' as any)).toBe(false);
    expect(!!isVNode({ type: 'text' } as any)).toBe(false);
    expect(!!isVNode({ type: 'comment' } as any)).toBe(false);
    expect(!!isVNode({ type: 'element' } as any)).toBe(true);
  });

  it('isComment', () => {
    expect(!!isComment(null)).toBe(false);
    expect(!!(isComment as any)()).toBe(false);
    expect(!!isComment('' as any)).toBe(false);
    expect(!!isComment({ type: 'text' } as any)).toBe(false);
    expect(!!isComment({ type: 'element' } as any)).toBe(false);
    expect(!!isComment({ type: 'comment' } as any)).toBe(true);
  });

  it('isCssLink', () => {
    expect(
      !!isCssLink({
        type: 'text',
        tagName: 'link',
        attributes: [{ key: 'rel', value: 'stylesheet' }],
      } as any),
    ).toBe(false);

    expect(
      !!isCssLink({
        type: 'comment',
        tagName: 'link',
        attributes: [{ key: 'rel', value: 'stylesheet' }],
      } as any),
    ).toBe(false);

    expect(
      !!isCssLink({
        type: 'element',
        tagName: 'style',
        attributes: [{ key: 'rel', value: 'stylesheet' }],
      } as any),
    ).toBe(false);

    expect(
      !!isCssLink({
        type: 'element',
        tagName: 'style',
        attributes: [{ key: 'rel', value: '_stylesheet' }],
      } as any),
    ).toBe(false);

    expect(
      !!isCssLink({
        type: 'element',
        tagName: 'link',
        attributes: [{ key: '_rel', value: 'stylesheet' }],
      } as any),
    ).toBe(false);

    expect(
      !!isCssLink({
        type: 'element',
        tagName: 'link',
        attributes: [{ key: 'rel', value: 'stylesheet' }],
      } as any),
    ).toBe(true);
  });

  it('isPrefetchJsLink', () => {
    expect(
      !!isPrefetchJsLink({
        type: 'element',
        tagName: 'link',
        attributes: [
          { key: 'as', value: 'style' },
          { key: 'rel', value: 'prefetch' },
        ],
      } as any),
    ).toBe(false);

    expect(
      !!isPrefetchJsLink({
        type: 'element',
        tagName: 'link',
        attributes: [
          { key: 'as', value: 'script' },
          { key: 'rel', value: 'stylesheet' },
        ],
      } as any),
    ).toBe(false);

    expect(
      !!isPrefetchJsLink({
        type: 'element',
        tagName: 'link',
        attributes: [{ key: 'rel', value: 'preload' }],
      } as any),
    ).toBe(false);

    expect(
      !!isPrefetchJsLink({
        type: 'element',
        tagName: 'link',
        attributes: [{ key: 'as', value: 'script' }],
      } as any),
    ).toBe(false);

    expect(
      !!isPrefetchJsLink({
        type: 'element',
        tagName: 'div',
        attributes: [
          { key: 'as', value: 'script' },
          { key: 'rel', value: 'prefetch' },
        ],
      } as any),
    ).toBe(false);

    expect(
      !!isPrefetchJsLink({
        type: 'element',
        tagName: 'link',
        attributes: [
          { key: 'as', value: 'script' },
          { key: 'rel', value: 'preload' },
        ],
      } as any),
    ).toBe(true);

    expect(
      !!isPrefetchJsLink({
        type: 'element',
        tagName: 'link',
        attributes: [
          { key: 'as', value: 'script' },
          { key: 'rel', value: 'prefetch' },
        ],
      } as any),
    ).toBe(true);
  });

  it('isAbsolute', () => {
    expect(isAbsolute('localhost:2333')).toBe(true);
    expect(isAbsolute('file://garfish.com')).toBe(true);
    expect(isAbsolute('http://garfish.com')).toBe(true);
    expect(isAbsolute('https://garfish.com')).toBe(true);
    expect(isAbsolute('httpS://garfish.com')).toBe(true);
    expect(isAbsolute('mailto:garfish@example.com')).toBe(true);
    expect(isAbsolute('javascript:throw%20document.cookie')).toBe(true);
    expect(isAbsolute('data:text/plain;base64,SGVsbG8sIFdQ%3D%3D')).toBe(true);
    expect(isAbsolute('data:text/plain;base64,transform="scaleY(0.5)"')).toBe(
      true,
    );
    expect(isAbsolute('foo')).toBe(false);
    expect(isAbsolute('foo/bar')).toBe(false);
    expect(isAbsolute('/foo/bar')).toBe(false);
    expect(isAbsolute('./x.png')).toBe(false);
    expect(isAbsolute('../x.png')).toBe(false);
    expect(isAbsolute('//sindresorhus.com')).toBe(false);
    expect(isAbsolute('c:\\')).toBe(false);
    expect(isAbsolute('c:\\Dev\test-broken')).toBe(false);
    expect(isAbsolute('C:\\Dev\\test-broken')).toBe(false);
    expect(isAbsolute('ht,tp://sindresorhus.com')).toBe(false);
  });

  it('removeElement', () => {
    const parent = document.createElement('div');
    const child = document.createElement('div');
    parent.appendChild(child);

    expect(child.parentNode).toBe(parent);
    expect(parent.parentNode).toBe(null);

    removeElement(child);
    removeElement(parent);

    expect(child.parentNode).toBe(null);
    expect(parent.parentNode).toBe(null);
  });

  it('createElement', () => {
    const el = createElement({ tagName: 'div' } as any);
    expect(el.nodeType).toBe(1);
    expect(el.tagName.toLowerCase()).toBe('div');
  });

  it('createSvgElement svg', () => {
    const svg = createElement({ tagName: 'svg' } as any);
    expect(svg.nodeType).toBe(1);
    expect(svg.tagName.toLowerCase()).toBe('svg');
    expect(svg.namespaceURI).toBe('http://www.w3.org/2000/svg');
  });

  it('createTextNode', () => {
    const el = createTextNode({ content: 'text node' } as any);
    expect(el.nodeType).toBe(3);
    expect(el.textContent).toBe('text node');
  });

  it('createLinkNode', () => {
    // 返回的是一个字符串
    expect(createLinkNode({ attributes: [] } as any)).toBe('<link ></link>');
    expect(
      createLinkNode({
        attributes: [{ key: 'rel', value: 'preload' }],
      } as any),
    ).toBe('<link rel="preload"></link>');
  });

  it('createStyleNode', () => {
    const match = (content: string) => {
      const el = createStyleNode(content);
      expect(el.nodeType).toBe(1);
      expect(el.textContent).toBe(content || '');
      expect(el.tagName.toLowerCase()).toBe('style');
    };

    match('');
    match(null);
    match('body {}');
  });

  it('createScriptNode', () => {
    const match = (vnode, content) => {
      const el = createScriptNode(vnode);
      expect(el.nodeType).toBe(8);
      expect(el.textContent).toBe(content);
    };

    match({}, '<script  execute by garfish></script>');
    match({ attributes: [] }, '<script  execute by garfish></script>');
    match(
      { attributes: [{ key: 'src', value: 'xx.js' }] },
      '<script src="xx.js"  execute by garfish></script>',
    );
    match(
      {
        children: [{ content: 'var a = 1;' }],
        attributes: [{ key: 'src', value: 'xx.js' }],
      },
      '<script src="xx.js"  execute by garfish>var a = 1;</script>',
    );
  });

  it('applyAttributes', () => {
    const el = document.createElement('div');
    const transform = (v) =>
      Object.keys(v).map((key) => ({ key, value: v[key] }));

    applyAttributes(
      el,
      transform({
        href: '/foo',
        minlength: 1,
        selected: null,
        disabled: false,
        'xlink:href': '#foo',
      }),
    );

    expect(el.getAttribute('href')).toBe('/foo');
    expect(el.hasAttribute('minlength')).toBe(false);
    expect(el.hasAttribute('selected')).toBe(true);
    expect(el.getAttribute('selected')).toBe('');
    expect(el.hasAttribute('disabled')).toBe(false);
    expect(el.getAttributeNS('http://www.w3.org/1999/xlink', 'href')).toBe(
      '#foo',
    );
  });

  it('findProp', () => {
    expect(findProp({ attributes: [{ key: 'a' }] } as any, 'a')).toEqual({
      key: 'a',
    });
    expect(findProp({ attributes: [{ key: 'a' }] } as any, 'b')).toBe(
      undefined,
    );
  });

  it('transformUrl', () => {
    expect(transformUrl('http://a', 'b.png')).toBe('http://a/b.png');
    expect(transformUrl('http://a', '/b.png')).toBe('http://a/b.png');
    expect(transformUrl('http://a', './b.png')).toBe('http://a/b.png');
    expect(transformUrl('http://a', 'http://a/b.png')).toBe('http://a/b.png');
    expect(transformUrl('https://a', 'b.png')).toBe('https://a/b.png');

    expect(transformUrl('a', './b.png')).toBe(`${location.href}b.png`);
    expect(transformUrl('/a', './b.png')).toBe(`${location.href}b.png`);
    expect(transformUrl('./a', './b.png')).toBe(`${location.href}b.png`);
  });

  it('transformCssUrl', () => {
    expect(transformCssUrl('http://a', '')).toBe('');
    expect(transformCssUrl('http://a', 'url("./b.png")')).toBe(
      'url("http://a/b.png")',
    );
    // 转换过后的路径统一用双引号
    expect(
      transformCssUrl(
        'http://a',
        `
          @import './b.css';
          @import url('./b.css');

          div[url="x.png"] {
            background: url('http://b.png') no-repeat;
          }
          body {
            background: url("./b.png") no-repeat;
            background: url('data:text/plain;base64,transform="scaleY(0.5)"') no-repeat;
          }
        `.trim(),
      ),
    ).toBe(
      `
          @import './b.css';
          @import url("http://a/b.css");

          div[url="x.png"] {
            background: url('http://b.png') no-repeat;
          }
          body {
            background: url("http://a/b.png") no-repeat;
            background: url('data:text/plain;base64,transform="scaleY(0.5)"') no-repeat;
          }
    `.trim(),
    );
  });
});
