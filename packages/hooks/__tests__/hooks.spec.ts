import {
  SyncHook,
  AsyncHook,
  SyncWaterfallHook,
  AsyncWaterfallHook,
} from '../src/index';

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

  it('SyncWaterfallHook', () => {
    const hook = new SyncWaterfallHook<{ name: string }>('test');
    expect(hook.type).toBe('test');

    hook.on((data) => {
      expect(data.name).toBe('chen');
      data.name += '1';
      return data;
    });
    hook.on((data) => {
      expect(data.name).toBe('chen1');
      data.name += '2';
      return data;
    });
    hook.once((data) => {
      expect(data.name).toBe('chen12');
      data.name += '3';
      return data;
    });

    let data = hook.emit({ name: 'chen' });
    expect(data).toEqual({ name: 'chen123' });
    data = hook.emit({ name: 'chen' });
    expect(data).toEqual({ name: 'chen12' });

    hook.removeAll();

    // @ts-ignore
    hook.on(() => {
      return '';
    });
    hook.on((data) => {
      data.name += '2';
      return data;
    });

    expect(() => hook.emit({ name: 'chen' })).toThrowError();

    const obj = { fn() {} };
    const spy = jest.spyOn(obj, 'fn');
    hook.onerror = obj.fn;

    data = hook.emit({ name: 'chen' });

    expect(spy).toHaveBeenCalled();
    expect(data).toEqual({ name: 'chen' });
    spy.mockReset();
    spy.mockRestore();
  });

  it('AsyncWaterfallHook', async () => {
    const hook = new AsyncWaterfallHook<{ name: string }>('test');
    expect(hook.type).toBe('test');

    hook.on(async (data) => {
      expect(data.name).toBe('chen');
      data.name += '1';
      return data;
    });
    hook.on((data) => {
      return new Promise((resolve) => {
        expect(data.name).toBe('chen1');
        data.name += '2';
        setTimeout(() => {
          resolve(data);
        }, 10);
      });
    });
    hook.once(async (data) => {
      expect(data.name).toBe('chen12');
      data.name += '3';
      return data;
    });

    let data = await hook.emit({ name: 'chen' });
    expect(data).toEqual({ name: 'chen123' });
    data = await hook.emit({ name: 'chen' });
    expect(data).toEqual({ name: 'chen12' });

    hook.removeAll();

    // @ts-ignore
    hook.on(async () => {
      return '';
    });
    hook.on(async (data) => {
      data.name += '2';
      return data;
    });

    let isError = false;
    try {
      await hook.emit({ name: 'chen' });
    } catch {
      isError = true;
    }
    expect(isError).toBe(true);

    const obj = { fn() {} };
    const spy = jest.spyOn(obj, 'fn');
    hook.onerror = obj.fn;

    data = await hook.emit({ name: 'chen' });

    expect(spy).toHaveBeenCalled();
    expect(data).toEqual({ name: 'chen' });
    spy.mockReset();
    spy.mockRestore();
  });

  it('AsyncWaterfallHook block', async () => {
    const hook = new AsyncWaterfallHook<{ n: number }>('test');

    hook.on((data) => {
      return data.n > 0 ? false : data;
    });
    hook.on((data) => {
      data.n++;
      return data;
    });

    let obj = { n: 0 };
    let data = await hook.emit(obj);
    expect(data).toEqual({ n: 1 });
    expect(obj === data).toBe(true);

    obj = { n: 1 };
    data = await hook.emit({ n: 1 });
    expect(data).toBe(false);
  });
});
