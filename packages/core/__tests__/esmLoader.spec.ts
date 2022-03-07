import {
  STRING_REG,
  COMMENT_REG,
  DYNAMIC_IMPORT_REG,
} from '../src/module/esModule';

describe('Core: esm loader', () => {
  it('comment reg', () => {
    let code = `
      a
      // 1
      //2
      /* 1 */
      /* //1 */
      console.log(1/*f*/2)
    `.trim();
    code = code.replace(COMMENT_REG, '');
    expect(code).toBe('a\n     \n     \n      \n      \n      console.log(12)');
  });

  it('string reg', () => {
    let code =
      'const a = \'chen\';const b = "tao";const c = \'ch\\\'en\';const tao = "t\\"tao"';
    code = code.replace(STRING_REG, '');
    expect(code).toBe('const a = ;const b = ;const c = ;const tao = ');
    // eslint-disable-next-line quotes
    code = "import a from './x.js';const d = \"import a from './x.js'\"";
    code = code.replace(STRING_REG, '');
    expect(code).toBe(';const d = ');
  });

  it('dynamic import reg', () => {
    let code =
      // eslint-disable-next-line quotes
      "import('a');const obj = { import(a) {\nimport('b')\n} };import(a + fn(import(a + b)) + 'a');";
    code = code.replace(DYNAMIC_IMPORT_REG, (k1) =>
      k1.replace('import', '_import_'),
    );
    expect(code).toBe(
      // eslint-disable-next-line quotes
      "_import_('a');const obj = { import(a) {\n_import_('b')\n} };_import_(a + fn(_import_(a + b)) + 'a');",
    );
  });
});
