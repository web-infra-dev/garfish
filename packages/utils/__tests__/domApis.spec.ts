import { DOMApis } from '../src/domApis';

describe('Garfish shared domApis', () => {
  const domApis = new DOMApis(document);
  it('set Attribute SVG xmlns:xlink', () => {
    const svg = domApis.createElement({
      type: 'element',
      key: 'svg',
      tagName: 'svg',
      children: [],
      attributes: [
        {
          key: 'xmlns:xlink',
          value: 'http://www.w3.org/1999/xlink',
        },
      ],
    });
    expect(svg.outerHTML).toBe('<svg xmlns:xlink="http://www.w3.org/1999/xlink"></svg>');
  });

  it('set Attribute SVG xlink:href', () => {
    const use = domApis.createElement({
      type: 'element',
      key: 'use',
      tagName: 'use',
      children: [],
      attributes: [
        {
          key: 'xlink:href',
          value: '#image1_1060_8858',
        },
      ],
    });
    expect(use.outerHTML).toBe('<use xlink:href="#image1_1060_8858"></use>');
  });

})