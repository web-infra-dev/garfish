import { SyncHook, PluginSystem } from '../src/index';

describe('hooks plugin', () => {
  it('parameter check', () => {
    const plugin = new PluginSystem({
      a: new SyncHook(),
      b: new SyncHook(),
    });

    expect(plugin.lifecycleKeys).toEqual(['a', 'b']);
    expect(() => {
      plugin.usePlugin([] as any);
    }).toThrowError();
    expect(() => {
      plugin.usePlugin({} as any);
    }).toThrowError();
    expect(() => {
      plugin.removePlugin('');
    }).toThrowError();
    expect(() => {
      plugin.removePlugin('a');
    }).toThrowError();
  });

  it('add plugin and remove plugin', () => {
    const plugin = new PluginSystem({
      a: new SyncHook(),
      b: new SyncHook(),
    });

    let i = 0;
    let j = 0;
    plugin.usePlugin({
      name: 'test1',
      a() {
        i++;
      },
      b() {
        j++;
      },
    });

    plugin.usePlugin({
      name: 'test2',
      a() {
        i++;
      },
      b() {
        j++;
      },
    });

    plugin.lifecycle.a.emit();
    expect(i).toBe(2);
    plugin.lifecycle.b.emit();
    expect(j).toBe(2);

    i = 0;
    j = 0;
    plugin.removePlugin('test1');

    plugin.lifecycle.a.emit();
    expect(i).toBe(1);
    plugin.lifecycle.b.emit();
    expect(j).toBe(1);
  });

  it('data check', () => {
    const plugin = new PluginSystem({
      a: new SyncHook<[string], void>(),
    });

    const obj = {
      name: 'test',
      a(s) {
        expect(s).toBe('chen');
      },
    };
    const spy = jest.spyOn(obj, 'a');
    plugin.usePlugin(obj);
    plugin.lifecycle.a.emit('chen');

    expect(spy).toHaveBeenCalled();
    spy.mockReset();
    spy.mockRestore();
  });

  it('Plugin inherit check(1)', () => {
    const plugin1 = new PluginSystem({
      a: new SyncHook<[string], void>(),
    });
    const plugin2 = new PluginSystem({
      a: new SyncHook<[string], void>(),
    });
    expect(() => plugin2.inherit(plugin1)).toThrowError();
  });

  it('Plugin inherit check(2)', () => {
    const plugin1 = new PluginSystem({
      a: new SyncHook<[string], void>(),
    });

    plugin1.usePlugin({
      name: 'test',
      a() {},
    });

    const plugin2 = new PluginSystem({
      b: new SyncHook<[string], void>(),
    });

    plugin2.usePlugin({
      name: 'test',
      b() {},
    });

    expect(() => plugin2.inherit(plugin1)).toThrowError();
  });

  it('Plugin inherit', () => {
    let i = 0;
    const plugin1 = new PluginSystem({
      a: new SyncHook<[string], void>(),
    });

    plugin1.usePlugin({
      name: 'test1',
      a(data) {
        i++;
        expect(data).toBe('chen');
      },
    });

    const plugin2 = new PluginSystem({
      b: new SyncHook<[string], void>(),
    });

    const plugin3 = plugin2.inherit(plugin1);

    plugin3.usePlugin({
      name: 'test3',
      a(data) {
        i++;
        expect(data).toBe('chen');
      },
    });

    plugin3.lifecycle.a.emit('chen');
    expect(i).toBe(2);
  });
});
