import { Sandbox } from '../src/sandbox';

// 测试所有的 sandbox 的行为
// 多沙箱共存
// 沙箱嵌套
// 嵌套共存同时存在
// 临时变量
// 禁用 with
describe('Sandbox', () => {
  let sandbox: Sandbox;
  window.dispatchEvent = () => true;

  const go = (code: string) => {
    return `
      const sandbox = typeof __debug_sandbox__ !== 'undefined'
        ? __debug_sandbox__
        : window.__debug_sandbox__;
      const Sandbox = sandbox.constructor;
      const nativeWindow = Sandbox.getNativeWindow();
      const parentWindow = sandbox.global[Symbol.for('garfish.globalObject')];
      ${code}
    `;
  };

  const create = (opts?: Partial<Sandbox['options']>) => {
    return new Sandbox({
      ...opts,
      namespace: 'app',
      modules: [
        () => ({
          recover() {},
          override: { go },
        }),
      ],
    });
  };

  // 多沙箱测试的脚本
  const multipleSandboxCode = `
    window.a = 2;
    Object.defineProperty(window, 'b', { value: 1 })

    expect(window.a).toBe(2);
    expect(nativeWindow.a).toBe(1);
    expect(window.b).toBe(1);
    expect(nativeWindow.b).toBe(undefined);

    sandbox.reset();
    sandbox.execScript(
      go(() => {
        window.a = 22;
        Object.defineProperty(window, 'b', { value: 11 })

        expect(window.a).toBe(22);
        expect(nativeWindow.a).toBe(1);
        expect(window.b).toBe(11);
        expect(nativeWindow.b).toBe(undefined);
      }),
    )

    // 虽然 reset 了，但是这里的 window 还在闭包里面
    // 等这段脚本执行完毕，就会被垃圾回收掉
    expect(window.a).toBe(2);
    expect(nativeWindow.a).toBe(1);
    expect(window.b).toBe(1);
    expect(nativeWindow.b).toBe(undefined);
  `;

  beforeEach(() => {
    // 清除副作用
    delete (window as any).a;
    delete (window as any).b;
    delete (window as any).c;
    (window as any).a = null;
    sandbox = create();
  });

  // 单个沙箱
  it('single box', () => {
    expect((window as any).a).toBe(null);
    (window as any).a = 1;
    expect((window as any).b).toBe(undefined);
    sandbox.execScript(
      go(`
        window.a = 2;
        expect(window.a).toBe(2);
        expect(nativeWindow.a).toBe(1);
        expect(window === nativeWindow).toBe(false);
        expect(parentWindow === nativeWindow).toBe(true);
        nativeWindow.b = 2;
      `),
    );
    expect((window as any).a).toBe(1);
    expect((window as any).b).toBe(2);
  });

  // 多个沙箱
  it('multiple box', () => {
    const code = (v: string) =>
      go(`
        expect(window.b).toBe(${v});
        window.b = 2;
        expect(window.b).toBe(2);
        expect(nativeWindow.b).toBe(1);
        nativeWindow.c = 2;
      `);
    expect((window as any).b).toBe(undefined);
    (window as any).b = 1;
    sandbox.execScript(code('1'));
    expect((window as any).b).toBe(1);
    expect((window as any).c).toBe(2);
    // 多次执行
    sandbox.execScript(code('2'));
    sandbox.reset();
    sandbox.execScript(code('1'));
    sandbox.execScript(code('2'));
    expect((window as any).b).toBe(1);
    expect((window as any).c).toBe(2);
    // 新的沙箱实例
    sandbox = create();
    sandbox.execScript(code('1'));
    expect((window as any).b).toBe(1);
    expect((window as any).c).toBe(2);
  });

  // 嵌套沙箱
  it('nested box', () => {
    expect((window as any).a).toBe(null);
    (window as any).a = 1;
    sandbox.execScript(go(multipleSandboxCode));
    expect((window as any).a).toBe(1);
  });

  // 嵌套和多沙箱共存
  it('nested and multiple box', () => {
    expect((window as any).a).toBe(null);
    (window as any).a = 1;
    sandbox.execScript(go(multipleSandboxCode));
    expect((window as any).a).toBe(1);
    // 再次执行
    sandbox.execScript(
      go(`
        expect(window.a).toBe(1);
        expect(nativeWindow.a).toBe(1);
        expect(window.b).toBe(undefined);
        expect(nativeWindow.b).toBe(undefined);
      `),
    );
    // 全新的沙盒是获取不到的
    const sandboxTwo = create();
    sandboxTwo.execScript(
      go(`
        expect(window.a).toBe(1);
        expect(nativeWindow.a).toBe(1);
        expect(window.b).toBe(undefined);
        expect(nativeWindow.b).toBe(undefined);
      `),
    );
    // reset 后，和全新的沙盒实例一致
    sandbox.reset();
    sandbox.execScript(
      go(`
        expect(window.a).toBe(1);
        expect(nativeWindow.a).toBe(1);
        expect(window.b).toBe(undefined);
        expect(nativeWindow.b).toBe(undefined);
      `),
    );
  });

  it('temporary variables', (next) => {
    const env = {
      next,
      a: 'envA',
    };
    sandbox.execScript(
      go(`
      expect(a).toBe('envA');
      expect(window.a).toBe(null);
      expect(typeof __debug_sandbox__).toBe('object');
      expect(window.__debug_sandbox__ === __debug_sandbox__).toBe(true);
      setTimeout(() => {
        expect(a).toBe('envA');
        expect(window.a).toBe(null);
        next();
      })
    `),
      env,
    );
    // 引用的对象变化，不影响内部使用的值
    env.a = 'changedEnvA';

    sandbox = create();
    sandbox.execScript(
      go(`
      expect(a).toBe(null);
      expect(window.a).toBe(null);
      expect(typeof __debug_sandbox__).toBe('object');
      setTimeout(() => {
        expect(a).toBe(null);
        expect(window.a).toBe(null);
        next();
      })
    `),
      {
        next,
      },
    );
  });

  it('disable with and temporary variables', (next) => {
    sandbox = create({ disableWith: true });
    const env = {
      next,
      a: 'envA',
    };
    sandbox.execScript(
      go(`
      expect(a).toBe('envA');
      expect(window.a).toBe(null);
      expect(typeof __debug_sandbox__).toBe('undefined');
      expect(typeof window.__debug_sandbox__).toBe('object');
      setTimeout(() => {
        expect(a).toBe('envA');
        expect(window.a).toBe(null);
        next();
      })
    `),
      env,
    );
    env.a = 'changedEnvA';
  });

  it('func in window bound test', (next) => {
    const NOOP = () => {};
    NOOP.n = 111;
    (window as any).n = NOOP;
    expect((window as any).n).toBe(NOOP);
    expect((window as any).n.n).toBe(111);
    sandbox.execScript(
      go('expect(window.n.n).toBe(111);next();'),
      { next }
    );
  });

  it('transferProps robustness test', (next) => {
    // 测试不可配置属性
    const testFunc = () => {};
    Object.defineProperty(testFunc, 'readonly', {
      value: 'cannot-change',
      writable: false,
      configurable: false
    });
    
    // 测试可配置属性
    Object.defineProperty(testFunc, 'configurable', {
      value: 'can-change',
      writable: true,
      configurable: true
    });
    
    // 测试普通属性
    testFunc.normal = 'normal-value';
    
    (window as any).testFunc = testFunc;
    
    sandbox.execScript(
      go(`
        expect(window.testFunc.readonly).toBe('cannot-change');
        expect(window.testFunc.configurable).toBe('can-change');
        expect(window.testFunc.normal).toBe('normal-value');
        next();
      `),
      { next }
    );
  });
});
