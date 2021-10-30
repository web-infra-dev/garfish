import { Sandbox } from '../src/sandbox';

// 测试所有的 sandbox 的行为
// 多沙箱共存
// 沙箱嵌套
// 嵌套共存同时存在
describe('Sandbox', () => {
  let sandbox: Sandbox;
  window.dispatchEvent = () => true;

  const go = (code: string) => {
    return `
      const sandbox = unstable_sandbox;
      const Sandbox = sandbox.constructor;
      const nativeWindow = Sandbox.getNativeWindow();
      const parentWindow = sandbox.global[Symbol.for('garfish.globalObject')];
      ${code}
    `;
  };

  const create = (opts = {}) => {
    return new Sandbox({
      ...opts,
      namespace: 'app',
      modules: [
        () => ({
          recover() {},
          override: {
            go,
            jest,
            expect,
          },
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
});
