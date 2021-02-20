import { getDefaultOptions } from '../src/config';

describe('Garfish config', () => {
  it('Check config', () => {
    const defaultOptions = getDefaultOptions();
    expect(defaultOptions).toMatchObject({
      apps: [],
      basename: '',
      sandbox: {
        open: true,
        hooks: {},
        modules: {},
        snapshot: false,
        useStrict: true,
        strictIsolation: false,
      },
      protectVariable: [],
      insulationVariable: [],
      autoRefreshApp: true,
      disableStatistics: false,
      disablePreloadApp: false,
    });

    expect(defaultOptions.customLoader).toBe(undefined);
    expect((defaultOptions.domGetter as any)()).toBe(null);
    expect((defaultOptions.beforeLoad as any)()).toBe(undefined);
    expect((defaultOptions.afterLoad as any)()).toBe(undefined);
    expect((defaultOptions.beforeEval as any)()).toBe(undefined);
    expect((defaultOptions.afterEval as any)()).toBe(undefined);
    expect((defaultOptions.beforeMount as any)()).toBe(undefined);
    expect((defaultOptions.afterMount as any)()).toBe(undefined);
    expect((defaultOptions.beforeUnmount as any)()).toBe(undefined);
    expect((defaultOptions.afterUnmount as any)()).toBe(undefined);
    expect((defaultOptions.onNotMatchRouter as any)()).toBe(undefined);

    expect(defaultOptions.errorLoadApp.length).toBe(1);
    expect(() => (defaultOptions.errorLoadApp as any)('error')).toThrowError(
      'error',
    );
    expect(defaultOptions.errorMountApp.length).toBe(1);
    expect(() => (defaultOptions.errorMountApp as any)('error')).toThrowError(
      'error',
    );
    expect(defaultOptions.errorUnmountApp.length).toBe(1);
    expect(() => (defaultOptions.errorUnmountApp as any)('error')).toThrowError(
      'error',
    );
  });
});
