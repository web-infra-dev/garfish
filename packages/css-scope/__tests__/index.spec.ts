import { parse, stringify } from '../src';

describe('Css scope', () => {
  it('should parse @container syntax correctly', () => {
    const css = `
      .card {
        container-type: inline-size;
      }

      @container (min-width: 400px) {
        .card-content {
          font-size: 18px;
        }
      }
    `;

    const ast = parse(css);
    const scopedCss = stringify(ast, 'MyApp');
    expect(scopedCss).toContain('@container (min-width: 400px)');
    expect(scopedCss).toContain('#MyApp .card-content');
    expect(scopedCss).toContain('font-size: 18px');
  });
});
