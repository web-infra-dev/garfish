import assert from 'assert';
import { Sandbox } from '../src/sandbox';

// 测试所有公开的 api
// 形参数量和类型，返回值，一些边界情况
describe('Apis', () => {
  let sandbox: Sandbox;
  const doc = () => ({});
  window.dispatchEvent = () => true;

  beforeEach(() => {
    sandbox = new Sandbox({
      namespace: 'app',
      modules: [doc],
    });
  });

  it('start', () => {
    // start 方法在初始化的时候就调用了
    expect(sandbox.closed).toBe(false);
    expect(sandbox.start.length).toBe(0);
    expect(sandbox.start()).toBe(undefined);
    expect(sandbox.closed).toBe(false);
  });

  it('close', () => {
    const spy = jest.spyOn(sandbox, 'clearEffects');
    expect(sandbox.closed).toBe(false);
    expect(sandbox.global && typeof sandbox.global === 'object').toBe(true);
    expect(sandbox.close.length).toBe(0);
    expect(sandbox.close()).toBe(undefined);
    expect(sandbox.closed).toBe(true);
    expect(sandbox.global).toBe(undefined);
    // close 应该调用 clearEffects
    expect(spy).toHaveBeenCalled();
  });

  it('reset', () => {
    const spyClose = jest.spyOn(sandbox, 'close');
    const spyStart = jest.spyOn(sandbox, 'start');
    expect(sandbox.closed).toBe(false);
    expect(sandbox.reset.length).toBe(0);
    expect(sandbox.reset()).toBe(undefined);
    expect(sandbox.closed).toBe(false);
    expect(spyClose).toHaveBeenCalled();
    expect(spyStart).toHaveBeenCalled();
  });

  it('createContext', () => {
    const context = sandbox.createProxyWindow();
    expect(sandbox.createProxyWindow.length).toBe(0);
    expect(typeof context).toBe('object');
    sandbox.close();
  });

  it('getOverrides', () => {
    const res = sandbox.getModuleData();
    expect(typeof res).toBe('object');
    expect(Array.isArray(res.recoverList)).toBe(true);
    expect(typeof res.recoverList).toBe('object');
    sandbox.close();
  });

  it('getGlobalObject', () => {
    const m = Sandbox.getNativeWindow();
    expect(m).toBe(window);
    expect(Sandbox.getNativeWindow.length).toBe(0);
    assert(sandbox.global);
    expect(sandbox.global[Symbol.for('garfish.globalObject') as any]).toBe(m);
  });

  it('execScript', () => {
    expect(sandbox.execScript('')).toBe(undefined);
    sandbox.close();
  });

  it('clearEffects', () => {
    let effect: null | boolean = null;
    sandbox = new Sandbox({
      namespace: 'app',
      modules: [
        () => {
          return {
            recover() {
              effect = null;
            },
            override: {
              document: {
                add() {
                  effect = true;
                },
              },
            },
          };
        },
      ],
    });
    expect(sandbox.clearEffects.length).toBe(0);
    expect(effect).toBe(null);
    sandbox.execScript('document.add()');
    expect(effect).toBe(true);
    sandbox.clearEffects();
    expect(effect).toBe(null);
  });
});
