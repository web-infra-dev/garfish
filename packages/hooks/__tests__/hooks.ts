import { SyncHook, AsyncHook, SyncWaterfallHook } from '../src/index';

describe('hooks', () => {
  it('SyncHook', () => {
    let i = 0;
    const hook = new SyncHook<[void], void>('test');
    expect(hook.type).toBe('test');

    hook.on(() => {
      i++;
    });
    hook.once(() => {
      i++;
    });

    hook.emit();
    expect(i).toBe(2);
    hook.emit();
    expect(i).toBe(3);
    hook.removeAll();
    hook.emit();
    expect(i).toBe(3);

    const fn = () => {
      i++;
    };
    hook.on(fn);
    hook.emit();
    expect(i).toBe(4);
    hook.remove(fn);
    hook.emit();
    expect(i).toBe(4);

    const hook1 = new SyncHook<[number, string], void>();
    expect(hook1.type).toBe('');

    hook1.on((a, b) => {
      expect(a).toBe(1);
      expect(b).toBe('1');
    });
    hook1.once((a, b) => {
      expect(a).toBe(1);
      expect(b).toBe('1');
    });
    hook1.emit(1, '1');
  });

  it('AsyncHook', async () => {
    let i = 0;
    const hook = new AsyncHook<[string]>('test');
    expect(hook.type).toBe('test');

    hook.on(async (a) => {
      expect(i).toBe(0);
      expect(a).toBe('1');
      i++;
    });
    hook.on((a) => {
      expect(a).toBe('1');
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(i).toBe(1);
          i++;
          resolve();
        });
      });
    });
    hook.on((a) => {
      expect(a).toBe('1');
      expect(i).toBe(2);
      i++;
    });

    await hook.emit('1');
    expect(i).toBe(3);

    i = 0;
    const hook1 = new AsyncHook();

    hook1.once(() => {
      i++;
      return false;
    });

    hook1.on(() => {
      i++;
    });

    await hook1.emit();
    expect(i).toBe(1);
    await hook1.emit();
    expect(i).toBe(2);

    hook1.once(async () => {
      return false;
    });
    hook1.on(() => {
      i++;
    });

    await hook1.emit();
    expect(i).toBe(3);
    await hook1.emit();
    expect(i).toBe(5);
  });

  it('SyncWaterfallHook', () => {});
});
