import { Sandbox } from '../src/sandbox';
import { Hooks } from '../src/types';

describe('Init', () => {
  let sandbox: Sandbox;
  window.dispatchEvent = () => true;

  beforeEach(() => {
    sandbox = new Sandbox({ namespace: 'app' });
  });

  // 初始化后检查 options
  it('init', () => {
    const opts = sandbox.options;
    expect(sandbox.closed).toBe(false);
    ['el', 'hooks', 'modules', 'namespace', 'useStrict'].forEach((key) => {
      expect(key in opts).toBe(true);
    });
    const hooksName = [
      'onstart',
      'onclose',
      'onerror',
      'onAppendNode',
      'onClearEffect',
      'onInvokeAfter',
      'onInvokeBefore',
      'onCreateContext',
    ];
    hooksName.forEach((key) => {
      expect(key in opts.hooks!).toBe(true);
      expect(hooksName.length).toBe(Object.keys(opts.hooks!).length);
      expect(typeof (opts.hooks![key as keyof Hooks] as Function)).toBe(
        'function',
      );
    });
    expect(opts.modules).toEqual({});
    expect(opts.useStrict).toBe(true);
    expect(opts.namespace).toBe('app');
    expect((opts.el as Function)()).toBe(null);
  });

  // 初始化后检查所有的 methods，不多不少
  it('methods', () => {
    const methods = [
      'start',
      'close',
      'reset',
      'optimizeGlobalMethod',
      'callHook',
      'execScript',
      'getOverrides',
      'clearEffects',
      'createContext',
    ];
    const sandboxMethods = Object.getOwnPropertyNames(
      Object.getPrototypeOf(sandbox),
    ).filter((v) => v !== 'constructor');
    expect('closed' in sandbox).toBe(true);
    expect('context' in sandbox).toBe(true);
    expect(methods.length).toBe(sandboxMethods.length);
    methods.forEach((m) => {
      expect(m in sandbox).toBe(true);
    });
  });

  // 检查 global 对象
  it('check global', () => {
    const subGlobal = sandbox.context;
    const baseGlobal = Sandbox.getGlobalObject();
    expect(typeof subGlobal).toBe('object');
    expect(Sandbox.isBaseGlobal(subGlobal)).toBe(false);
    expect(Sandbox.isBaseGlobal(baseGlobal)).toBe(true);
    expect(baseGlobal).toBe(
      subGlobal[Symbol.for('garfish.globalObject') as any],
    );
  });
});
