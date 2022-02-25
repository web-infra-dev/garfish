import fetch from 'node-fetch';
import { Runtime } from '../src/runtime';

describe('es module', () => {
  const runtime = new Runtime();
  const _import = async (entry) => {
    entry = new URL(entry, 'http://localhost:3310/es-module/__tests__/').href;
    await runtime.importByUrl(entry);
    return new Promise((resolve) => setTimeout(resolve));
  };

  beforeEach(() => {
    globalThis.orderIndex = 0;
    (globalThis as any).fetch = fetch;
  });

  it('export declaration', async () => {
    await _import('./case/exportDeclaration/m1.js');
  });

  it('circular reference', async () => {
    await _import('./case/circularReference/m1.js');
  });

  it('export namespace', async () => {
    await _import('./case/exportNamespace/m1.js');
  });

  it('import meta', async () => {
    await _import('./case/importMeta/m1.js');
  });

  it('variable check', async () => {
    await _import('./case/variableCheck/m1.js');
  });

  it('dynamic import', async () => {
    await _import('./case/dynamicImport/m1.js');
  });

  it('execution order check', async () => {
    await _import('./case/executionOrder/m1.js');
  });

  it('resource redirect', async () => {
    await _import('./case/resourceRedirect/m1.js');
  });

  it('import check(import)', async () => {
    let isError = false;
    try {
      await _import('./case/importCheck/m1.js');
    } catch {
      isError = true;
    }
    expect(isError).toBe(true);
  });

  it('import check(export)', async () => {
    let isError = false;
    try {
      await _import('./case/importCheck/m2.js');
    } catch {
      isError = true;
    }
    expect(isError).toBe(true);
  });

  it('strict mode check', async () => {
    let isError = false;
    try {
      await _import('./case/strictModeCheck/m1.js');
    } catch {
      isError = true;
    }
    expect(isError).toBe(true);
  });
});
