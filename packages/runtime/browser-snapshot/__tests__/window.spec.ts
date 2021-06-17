import { PatchGlobalVal } from '../src/patchers/variable';

declare global {
  interface Window {
    [index: string]: any;
  }
}

// 1.Can remove the sand box running normal test box during the side effects of the variables on the window global variables
// 2.Test sandbox can protect properly named variables in the closure will not remove the sandbox
describe('snapshot sandbox window', () => {
  it('test normal obj', () => {
    const obj: any = {
      update: 'update value',
      name: 'add delete val',
      nObj: { name: 'hello' },
    };

    const nVal = new PatchGlobalVal(obj);
    nVal.activate();

    obj.a = 'hello';
    obj.update = 'new value';
    delete obj.name;

    nVal.deactivate();

    expect(obj).toMatchSnapshot();

    nVal.activate();
    expect(obj).toMatchSnapshot();
  });

  it('Add a variable test', () => {
    const PatchGlobal = new PatchGlobalVal(window);

    const fn = function a() {};
    const ar = [];
    const ob = { name: 'obj' };

    // snapshot
    PatchGlobal.activate();

    window.fn = fn;
    window.nm = 123;
    window.st = 'string';
    window.ar = ar;
    window.bl = true;
    window.nl = null;
    (window as any)[1] = 1234;
    window.ob = ob;

    // Remove the side effects
    PatchGlobal.deactivate();

    expect(window.fn).toBe(undefined);
    expect(window.nm).toBe(undefined);
    expect(window.st).toBe(undefined);
    expect(window.ar).toBe(undefined);
    expect(window.bl).toBe(undefined);
    expect(window.nl).toBe(undefined);
    expect(window[1]).toBe(undefined);
    expect(window.ob).toBe(undefined);

    // restore side effects
    PatchGlobal.activate();

    expect(window.fn).toBe(fn);
    expect(window.nm).toBe(123);
    expect(window.st).toBe('string');
    expect(window.ar).toBe(ar);
    expect(window.bl).toBe(true);
    expect(window.nl).toBe(null);
    expect(window[1]).toBe(1234);
    expect(window.ob).toBe(ob);
  });

  it('Test to delete variables', () => {
    const PatchGlobal = new PatchGlobalVal(window);
    const fn = function a() {};
    const ar = [];
    const ob = { name: 'obj' };
    window.fn = fn;
    window.nm = 123;
    window.st = 'string';
    window.ar = ar;
    window.bl = true;
    window.nl = null;
    (window as any)[1] = 1234;
    window.ob = ob;

    // snapshot
    PatchGlobal.activate();

    delete window.fn;
    delete window.nm;
    delete window.st;
    delete window.ar;
    delete window.bl;
    delete window.nl;
    delete (window as any)[1];
    delete window.ob;

    // Remove the side effects
    PatchGlobal.deactivate();

    expect(window.fn).toBe(fn);
    expect(window.nm).toBe(123);
    expect(window.st).toBe('string');
    expect(window.ar).toBe(ar);
    expect(window.bl).toBe(true);
    expect(window.nl).toBe(null);
    expect(window[1]).toBe(1234);
    expect(window.ob).toBe(ob);

    // restore side effects
    PatchGlobal.activate();

    expect(window.fn).toBe(undefined);
    expect(window.nm).toBe(undefined);
    expect(window.st).toBe(undefined);
    expect(window.ar).toBe(undefined);
    expect(window.bl).toBe(undefined);
    expect(window.nl).toBe(undefined);
    expect(window[1]).toBe(undefined);
    expect(window.ob).toBe(undefined);
  });
});
