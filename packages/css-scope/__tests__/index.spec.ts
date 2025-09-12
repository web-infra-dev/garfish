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

  it('should parse @keyframes syntax correctly', () => {
    const css = `
      .\@1_0_0_2444__aTWceUPNFbTpZsnHPM94_semi-icon-spinning {
        animation: \@1_0_0_2444__XXl2sOw3Pp3KVSQS9PFl_semi-icon-animation-rotate .6s linear infinite;
        animation-fill-mode: forwards;
      }

      @keyframes \@1_0_0_2444__XXl2sOw3Pp3KVSQS9PFl_semi-icon-animation-rotate {
        0% {
          transform: rotate(0)
        }
        to {
          transform: rotate(1turn)
        }
      }
    `;

    const ast = parse(css);
    const scopedCss = stringify(ast, 'MyApp');
    console.log(scopedCss);
    expect(scopedCss).toContain(
      'MyApp-@1_0_0_2444__XXl2sOw3Pp3KVSQS9PFl_semi-icon-animation-rotate',
    );
  });
});
