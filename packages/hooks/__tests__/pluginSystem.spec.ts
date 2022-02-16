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
});
