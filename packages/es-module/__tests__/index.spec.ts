import { mockStaticServer } from  '@garfish/utils';
import { Runtime } from '../src/runtime';

describe('es module', () => {
  const runtime = new Runtime();
  const _import_ = (entry: string) => {
    entry = new URL(entry, 'http://localhost').href;
    return runtime.importByUrl(entry);
  }

  mockStaticServer(__dirname, ['lodash']);

  beforeEach(() => {
    globalThis.orderIndex = 0;
  });

  // 重定向测试，如果网络不稳定可以注释掉
  it('resource redirect', async () => {
    await _import_('./case/resourceRedirect/m1.js');
  });

  it('export declaration', async () => {
    await _import_('./case/exportDeclaration/m1.js');
  });

  it('circular reference', async () => {
    await _import_('./case/circularReference/m1.js');
  });

  it('export namespace', async () => {
    await _import_('./case/exportNamespace/m1.js');
  });

  it('import meta', async () => {
    await _import_('./case/importMeta/m1.js');
  });

  it('variable check', async () => {
    await _import_('./case/variableCheck/m1.js');
  });

  it('dynamic import', async () => {
    await _import_('./case/dynamicImport/m1.js');
  });

  it('execution order check', async () => {
    await _import_('./case/executionOrder/m1.js');
  });

  it('import check(import)', async () => {
    let isError = false;
    try {
      await _import_('./case/importCheck/m1.js');
    } catch {
      isError = true;
    }
    expect(isError).toBe(true);
  });

  it('import check(export)', async () => {
    let isError = false;
    try {
      await _import_('./case/importCheck/m2.js');
    } catch {
      isError = true;
    }
    expect(isError).toBe(true);
  });

  it('strict mode check', async () => {
    let isError = false;
    try {
      await _import_('./case/strictModeCheck/m1.js');
    } catch {
      isError = true;
    }
    expect(isError).toBe(true);
  });
});
