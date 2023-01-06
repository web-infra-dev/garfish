import { templateParse } from '../src/templateParse';


function Attributes(this: any, { name, value }) {
  this.key = name;
  this.value = value;
}

describe('Garfish shared templateParse', () => {
  it('parse SVG feFlood', () => {
    const [ast] = templateParse('<head></head><body><svg xmlns="http://www.w3.org/2000/svg"><feFlood flood-opacity="0"/></svg></body>', []);
    expect(ast).toEqual([{
      type: 'element',
      tagName: 'head',
      attributes: [],
      children: [],
    },{
      type: 'element',
      tagName: 'body',
      attributes: [],
      children: [{
        type: 'element',
        tagName: 'svg',
        attributes: [new Attributes({
          name: 'xmlns',
          value: 'http://www.w3.org/2000/svg',
        })],
        children: [
          {
            type: 'element',
            tagName: 'feFlood',
            attributes: [new Attributes({
              name: 'flood-opacity',
              value: '0',
            })],
            children: [],
          },
        ],
      }],
    }])
  });

  it('parse Uppercase DIV', () => {
    const [ast] = templateParse('<head></head><body><DIV id="div"/></body>', []);
    expect(ast).toEqual([{
      type: 'element',
      tagName: 'head',
      attributes: [],
      children: [],
    },{
      type: 'element',
      tagName: 'body',
      attributes: [],
      children: [{
        type: 'element',
        tagName: 'div',
        attributes: [new Attributes({
          name: 'id',
          value: 'div',
        })],
        children: [],
      }],
    }]);
  });
});