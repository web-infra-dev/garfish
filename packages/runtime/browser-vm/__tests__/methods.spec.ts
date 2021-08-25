import { Sandbox } from '../src/sandbox';

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
    ['el', 'modules', 'namespace', 'disableWith'].forEach((key) => {
      expect(key in opts).toBe(true);
    });
    expect(opts.modules).toEqual([]);
    expect(opts.disableWith).toBe(false);
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
      'execScript',
      'getModuleData',
      'clearEffects',
      'createProxyWindow',
    ];
    const sandboxMethods = Object.getOwnPropertyNames(
      Object.getPrototypeOf(sandbox),
    ).filter((v) => v !== 'constructor');
    expect('closed' in sandbox).toBe(true);
    expect('global' in sandbox).toBe(true);
    expect(methods.length).toBe(sandboxMethods.length);
    methods.forEach((m) => {
      expect(m in sandbox).toBe(true);
    });
  });

  // 检查 global 对象
  it('check global', () => {
    const subGlobal = sandbox.global;
    const baseGlobal = Sandbox.getNativeWindow();
    expect(typeof subGlobal).toBe('object');
    expect(baseGlobal).toBe(
      subGlobal[Symbol.for('garfish.globalObject') as any],
    );
  });
});
