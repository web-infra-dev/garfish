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
      modules: { document: doc },
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
    expect(sandbox.context && typeof sandbox.context === 'object').toBe(true);
    expect(sandbox.close.length).toBe(0);
    expect(sandbox.close()).toBe(undefined);
    expect(sandbox.closed).toBe(true);
    expect(sandbox.context).toBe(null);
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
    const context = sandbox.createContext();
    expect(sandbox.createContext.length).toBe(1);
    expect(typeof context).toBe('object');
    sandbox.close();
    expect(sandbox.createContext.bind(sandbox)).toThrow(/Garfish warning/);
  });

  it('getOverrides', () => {
    const res = sandbox.getOverrides();
    expect(typeof res).toBe('object');
    expect(Array.isArray(res.recovers)).toBe(true);
    expect(typeof res.overrides).toBe('object');
    sandbox.close();
    expect(sandbox.getOverrides.bind(sandbox)).toThrow(/Garfish warning/);
  });

  it('getGlobalObject', () => {
    const m = Sandbox.getGlobalObject();
    expect(m).toBe(window);
    expect(Sandbox.getGlobalObject.length).toBe(0);
    expect(sandbox.context[Symbol.for('garfish.globalObject') as any]).toBe(m);
  });

  it('isBaseGlobal', () => {
    expect(Sandbox.isBaseGlobal.length).toBe(1);
    expect(Sandbox.isBaseGlobal(sandbox.context)).toBe(false);
    expect(Sandbox.isBaseGlobal(Sandbox.getGlobalObject())).toBe(true);
  });

  it('execScript', () => {
    const spy = jest.spyOn(sandbox, 'clearEffects');
    // expect(sandbox.execScript.length).toBe(2);
    expect(sandbox.execScript('')).toBe(undefined);
    sandbox.close();
    expect(sandbox.createContext.bind(sandbox)).toThrow(/Garfish warning/);
  });

  it('callHook', () => {
    expect(sandbox.callHook('onstart')).toEqual([undefined]);
    sandbox.options.hooks!.onstart = undefined;
    expect(sandbox.callHook('onstart')).toEqual(false);
    sandbox.options.hooks!.onstart = [];
    expect(sandbox.callHook('onstart')).toEqual(false);
  });

  it('clearEffects', () => {
    let effect: null | boolean = null;
    sandbox = new Sandbox({
      namespace: 'app',
      modules: {
        test: () => {
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
      },
    });
    expect(sandbox.clearEffects.length).toBe(0);
    expect(effect).toBe(null);
    sandbox.execScript('document.add()');
    expect(effect).toBe(true);
    sandbox.clearEffects();
    expect(effect).toBe(null);
  });
});
