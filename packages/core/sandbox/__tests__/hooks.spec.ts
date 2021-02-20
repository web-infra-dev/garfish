import Sandbox from '../src/index';
import { Hooks } from '../src/types';

// 测试所有的 hooks
describe('Hooks', () => {
  let sandbox: Sandbox;
  window.dispatchEvent = () => true;
  const create = (hooks: Hooks) =>
    new Sandbox({
      hooks,
      namespace: 'app',
    });

  it('onstart', () => {
    const run = (isArr: boolean) => {
      const onstart = jest.fn();
      sandbox = create({
        onstart: isArr ? [onstart] : onstart,
      });
      expect(onstart.mock.calls.length).toBe(1);
      expect(onstart.mock.calls[0].length).toBe(1);
      expect(onstart.mock.calls[0][0] === sandbox).toBe(true);
      sandbox.start();
      expect(onstart.mock.calls.length).toBe(2);
    };
    run(true);
    run(false);
  });

  it('onclose', () => {
    const run = (isArr: boolean) => {
      const onclose = jest.fn();
      sandbox = create({
        onclose: isArr ? [onclose] : onclose,
      });
      expect(onclose.mock.calls.length).toBe(0);
      sandbox.close();
      expect(onclose.mock.calls.length).toBe(1);
      expect(onclose.mock.calls[0].length).toBe(1);
      expect(onclose.mock.calls[0][0] === sandbox).toBe(true);
    };
    run(true);
    run(false);
  });

  // it('onerror', () => {
  //   let intoErr = false;
  //   sandbox = create({});
  //   try {
  //     sandbox.execScript('throw "error"');
  //   } catch (error) {
  //     intoErr = true;
  //     // 默认的 error 是会自己生产一个 Error 对象
  //     expect(error.message.trim()).toBe('[Garfish warning]: error');
  //   }
  //   expect(intoErr).toBe(true);

  //   const run = (isArr: boolean) => {
  //     const onerror = jest.fn();
  //     sandbox = create({
  //       onerror: isArr ? [onerror] : onerror,
  //     });
  //     sandbox.execScript('throw "error"');
  //     expect(onerror.mock.calls.length).toBe(1);
  //     expect(onerror.mock.calls[0].length).toBe(1);
  //     expect(onerror.mock.calls[0][0].trim()).toBe('error');
  //   };
  //   run(true);
  //   run(false);
  // });

  it('onClearEffect', () => {
    const run = (isArr: boolean) => {
      const onClearEffect = jest.fn();
      sandbox = create({
        onClearEffect: isArr ? [onClearEffect] : onClearEffect,
      });
      expect(onClearEffect.mock.calls.length).toBe(0);
      sandbox.clearEffects();
      sandbox.execScript('');
      sandbox.clearEffects();
      // 虽然两次，但实际上第一次没有 recovers，钩子不会被触发
      expect(onClearEffect.mock.calls.length).toBe(1);
      expect(onClearEffect.mock.calls[0].length).toBe(1);
      expect(onClearEffect.mock.calls[0][0] === sandbox).toBe(true);
    };
    run(true);
    run(false);
  });

  it('onInvokeBefore', () => {
    const run = (isArr: boolean) => {
      const onInvokeBefore = jest.fn();
      sandbox = create({
        onInvokeBefore: isArr ? [onInvokeBefore] : onInvokeBefore,
      });
      expect(onInvokeBefore.mock.calls.length).toBe(0);
      sandbox.execScript('');
      sandbox.execScript('');
      // 每一次执行都会调用钩子
      expect(onInvokeBefore.mock.calls.length).toBe(2);
      expect(onInvokeBefore.mock.calls[0].length).toBe(2);
      expect(onInvokeBefore.mock.calls[0][0] === sandbox).toBe(true);
      const refs = onInvokeBefore.mock.calls[0][1];
      const args = ['url', 'code', 'context'];
      expect(Object.keys(refs).length).toBe(args.length);
      args.forEach((key) => {
        expect(key in refs).toBe(true);
      });
    };
    run(true);
    run(false);
  });

  it('onInvokeAfter', () => {
    const run = (isArr: boolean) => {
      const onInvokeAfter = jest.fn();
      sandbox = create({
        onInvokeAfter: isArr ? [onInvokeAfter] : onInvokeAfter,
      });
      expect(onInvokeAfter.mock.calls.length).toBe(0);
      sandbox.execScript('');
      sandbox.execScript('');
      expect(onInvokeAfter.mock.calls.length).toBe(2);
      expect(onInvokeAfter.mock.calls[0].length).toBe(2);
      expect(onInvokeAfter.mock.calls[0][0] === sandbox).toBe(true);
    };
    run(true);
    run(false);
  });

  it('onCreateContext', () => {
    const run = (isArr: boolean) => {
      const onCreateContext = jest.fn();
      sandbox = create({
        onCreateContext: isArr ? [onCreateContext] : onCreateContext,
      });
      sandbox.createContext();
      expect(onCreateContext.mock.calls.length).toBe(2);
      expect(onCreateContext.mock.calls[0].length).toBe(1);
      expect(onCreateContext.mock.calls[0][0] === sandbox).toBe(true);
    };
    run(true);
    run(false);
  });
});
