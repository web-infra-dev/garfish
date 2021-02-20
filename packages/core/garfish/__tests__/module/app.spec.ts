import Sandbox from '@garfish/sandbox';
import { Garfish } from '../../src/garfish';
import { createGarfish, mockHtmlEntry } from '../testUtils';

describe('Garfish app instance', () => {
  let props;
  let garfish: Garfish;
  let appWraper: HTMLDivElement;

  beforeEach(() => {
    props = {};
    appWraper = document.createElement('div');
    garfish = createGarfish({
      props,
      domGetter: () => appWraper,
      sandbox: {
        snapshot: false,
      },
    });
    garfish.registerApp({
      name: 'app',
      entry: mockHtmlEntry,
    });
  });

  it('App id increment', async () => {
    const app1 = await garfish.loadApp('app');
    const app2 = await garfish.loadApp('app');
    expect(app1.id).toBe(0);
    expect(app2.id).toBe(1);
  });

  it('Check public attributes', async () => {
    const app = await garfish.loadApp('app');

    expect(app.name).toBe('app');
    expect(app.mounted).toBe(false);
    expect(app.display).toBe(false);
    expect(app.sandboxType).toBe('vm');
    expect(app.isHtmlMode).toBe(true);
    expect(app.context === garfish).toBe(true);
    expect(app.sandbox instanceof Sandbox).toBe(true);
    expect(app.provider).toBe(undefined);
    expect(app.htmlNode).toBe(undefined);
    expect(app.appContainer).toBe(undefined);
    expect(app.cjsModules).toMatchObject({
      exports: {},
    });
    expect(app.appInfo).toMatchObject({
      name: 'app',
      entry: mockHtmlEntry,
    });
    expect(app.options !== garfish.options).toBe(true);
    expect(app.options).toMatchObject(garfish.options);
  });

  it('Check public methods', async () => {
    const app = await garfish.loadApp('app');
    [
      'isSnapshotSandbox',
      'getProvider',
      'show',
      'hide',
      'mount',
      'unmount',
      'compile',
      'sandBoxActive',
      'sandBoxDeactivate', // 这里方法是兼容 snapshotApp
      'execScript',
    ].forEach((n) => expect(typeof app[n]).toBe('function'));
  });

  it('entryResManager', async () => {
    const app = await garfish.loadApp('app');
    expect(app.isHtmlMode).toBe(true);
    expect((app as any).entryResManager.type).toBe('html');
    expect((app.sandbox as Sandbox).options.baseUrl).toBe(
      (app as any).entryResManager.opts.url,
    );
  });

  it('isSnapshotSandbox', async () => {
    const app = await garfish.loadApp('app');
    expect(app.isSnapshotSandbox.length).toBe(0);
    expect(app.isSnapshotSandbox()).toBe(false);
    app.sandboxType = 'snapshot';
    expect(app.isSnapshotSandbox()).toBe(true);
  });

  it('getProvider', async () => {
    const app = await garfish.loadApp('app');
    expect(app.getProvider.length).toBe(0);
    let res: any = app.getProvider();
    expect(typeof res.then).toBe('function');
    res = await res;
    expect(res).toBe(undefined);
  });

  it('show [1]', async () => {
    const app = await garfish.loadApp('app');
    expect(app.show.length).toBe(0);
    expect(app.display).toBe(false);
    expect(app.mounted).toBe(false);
    expect(app.show()).toBe(false);
  });

  it('show [2]', async () => {
    const app = await garfish.loadApp('app');
    await app.mount();
    expect(app.display).toBe(true);
    expect(app.mounted).toBe(true);
    expect(app.show()).toBe(false);
  });

  it('show [3]', async () => {
    const app = await garfish.loadApp('app');
    await app.mount();
    app.hide();
    expect(app.display).toBe(false);
    expect(app.mounted).toBe(true);

    const spyRender = jest.spyOn(app as any, 'callRender');
    const spyAddDoc = jest.spyOn(app as any, 'addToDocument');

    expect(app.show()).toBe(true);
    expect(app.display).toBe(true);
    expect(spyAddDoc.mock.calls.length).toBe(1);
    expect(spyRender.mock.calls.length).toBe(1);
    expect(Object.keys(spyRender.mock.calls[0][0]).sort()).toEqual(
      ['render', 'destroy'].sort(),
    );

    spyRender.mockRestore();
    spyAddDoc.mockRestore();
  });

  it('hide', async () => {
    const app = await garfish.loadApp('app');
    expect(app.hide.length).toBe(0);
    expect(app.hide()).toBe(false);
    expect(app.display).toBe(false);

    await app.mount();
    const spyDestroy = jest.spyOn(app as any, 'callDestroy');

    expect(app.display).toBe(true);
    expect(app.hide()).toBe(true);
    expect(app.display).toBe(false);
    expect(spyDestroy.mock.calls.length).toBe(1);
    expect(Object.keys(spyDestroy.mock.calls[0][0]).sort()).toEqual(
      ['render', 'destroy'].sort(),
    );

    expect(app.hide()).toBe(false);
    expect(app.display).toBe(false);

    app.show();

    expect(app.display).toBe(true);
    expect(app.hide()).toBe(true);
    expect(app.display).toBe(false);
    expect(spyDestroy.mock.calls.length).toBe(2);
    expect(Object.keys(spyDestroy.mock.calls[1][0]).sort()).toEqual(
      ['render', 'destroy'].sort(),
    );

    spyDestroy.mockRestore();
  });

  it('mount', async () => {
    const app = await garfish.loadApp('app');

    const res = await app.mount();
    expect(res).toBe(true);
    expect(app.display).toBe(true);
    expect(app.mounted).toBe(true);
    expect(app.context.activeApps.length).toBe(1);
    expect(app.context.activeApps[0] === app).toBe(true);
    expect(app.appContainer.parentNode.nodeName.toLowerCase()).toBe('div');
  });

  it('mount [mounting]', async () => {
    const app = await garfish.loadApp('app');

    app.mount();
    const res = await app.mount();
    expect(res).toBe(false);
    expect(app.display).toBe(false);
    expect(app.mounted).toBe(false);
    expect(app.context.activeApps.length).toBe(0);
  });

  it('mount [mounted]', async () => {
    const app = await garfish.loadApp('app');
    const spy = jest.spyOn(app, 'unmount');

    app.mounted = true;
    const res = await app.mount();
    expect(res).toBe(true);
    expect(spy.mock.calls.length).toBe(1);
    spy.mockRestore();
  });

  it('mount [compile]', async () => {
    const app = await garfish.loadApp('app');
    const spy = jest.spyOn(app, 'compile');

    const res = await app.mount();
    expect(res).toBe(true);
    expect(spy.mock.calls.length).toBe(1);
    spy.mockRestore();
  });

  it('mount [callRender]', async () => {
    const app = await garfish.loadApp('app');
    const spy = jest.spyOn(app as any, 'callRender');

    const res = await app.mount();
    expect(res).toBe(true);
    expect(spy.mock.calls.length).toBe(1);
    spy.mockRestore();
  });

  it('mount [hooks]', async () => {
    let i = 0;
    const app = await garfish.loadApp('app', {
      beforeMount(appInfo, basename) {
        expect(i).toBe(0);
        expect(arguments.length).toBe(2);
        expect(appInfo === app.appInfo).toBe(true);
        expect(basename === app.options.basename).toBe(true);
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            i++;
            resolve();
          });
        });
      },
      afterMount(appInfo, basename) {
        expect(i).toBe(2);
        expect(arguments.length).toBe(2);
        expect(appInfo === app.appInfo).toBe(true);
        expect(basename === app.options.basename).toBe(true);
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            i++;
            resolve();
          });
        });
      },
    });

    garfish.on('startMountApp', function (_app) {
      expect(i).toBe(1);
      expect(arguments.length).toBe(1);
      expect(_app === app).toBe(true);
      i++;
    });

    garfish.on('endMountApp', function (_app) {
      expect(i).toBe(3);
      expect(arguments.length).toBe(1);
      expect(_app === app).toBe(true);
      i++;
    });

    await app.mount();
    expect(i).toBe(4);
  });

  it('mount [error]', async () => {
    let i = 0;
    const app = await garfish.loadApp('app', {
      errorMountApp(e, appInfo) {
        expect(i).toBe(1);
        expect(arguments.length).toBe(2);
        expect(appInfo === app.appInfo).toBe(true);
        expect(e).toBe('test error');
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            i++;
            resolve();
          });
        });
      },
    });

    garfish.on('errorMountApp', function (_app, e) {
      expect(i).toBe(0);
      expect(arguments.length).toBe(2);
      expect(_app === app).toBe(true);
      expect(e).toBe('test error');
      i++;
    });

    (app as any).callRender = function () {
      throw 'test error';
    };

    const res = await app.mount();
    expect(res).toBe(false);
    expect((app as any).mounting).toBe(false);
    expect(i).toBe(2);
    expect(app.appContainer.parentNode).toBe(null);
  });

  it('unmount', async () => {
    const app = await garfish.loadApp('app');
    expect(app.unmount.length).toBe(0);
    let res = await app.unmount();
    expect(res).toBe(false);

    await app.mount();
    expect(app.context.activeApps.length).toBe(1);

    res = await app.unmount();
    expect(res).toBe(true);
    expect(app.display).toBe(false);
    expect(app.mounted).toBe(false);
    expect(app.context.activeApps.length).toBe(0);
  });

  it('unmount [unmounting]', async () => {
    const app = await garfish.loadApp('app');

    await app.mount();
    app.unmount();
    const res = await app.unmount();
    expect(res).toBe(false);
    expect(app.display).toBe(true);
    expect(app.mounted).toBe(true);
  });

  it('unmount [mounted]', async () => {
    const app = await garfish.loadApp('app');

    await app.mount();
    app.mounted = false;
    const res = await app.unmount();
    expect(res).toBe(false);
    expect(app.display).toBe(true);
    expect(app.mounted).toBe(false);
  });

  it('unmount [appContainer]', async () => {
    const app = await garfish.loadApp('app');

    await app.mount();
    (app as any).appContainer = null;
    const res = await app.unmount();
    expect(res).toBe(false);
    expect(app.display).toBe(true);
    expect(app.mounted).toBe(true);
  });

  it('unmount [callDestroy]', async () => {
    const app = await garfish.loadApp('app');
    const spy = jest.spyOn(app as any, 'callDestroy');

    await app.mount();
    await app.unmount();

    expect(spy.mock.calls.length).toBe(1);
    spy.mockRestore();
  });

  it('unmount [hooks]', async () => {
    let i = 0;
    const app = await garfish.loadApp('app', {
      beforeUnmount(appInfo, basename) {
        expect(i).toBe(0);
        expect(arguments.length).toBe(2);
        expect(appInfo === app.appInfo).toBe(true);
        expect(basename === app.options.basename).toBe(true);
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            i++;
            resolve();
          });
        });
      },
      afterUnmount(appInfo, basename) {
        expect(i).toBe(2);
        expect(arguments.length).toBe(2);
        expect(appInfo === app.appInfo).toBe(true);
        expect(basename === app.options.basename).toBe(true);
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            i++;
            resolve();
          });
        });
      },
    });

    garfish.on('startUnmountApp', function (_app) {
      expect(i).toBe(1);
      expect(arguments.length).toBe(1);
      expect(app === _app).toBe(true);
      i++;
    });

    garfish.on('endUnmountApp', function (_app) {
      expect(i).toBe(3);
      expect(arguments.length).toBe(1);
      expect(app === _app).toBe(true);
      i++;
    });

    await app.mount();
    await app.unmount();
    expect(i).toBe(4);
  });

  it('unmount [error]', async () => {
    let i = 0;
    const app = await garfish.loadApp('app', {
      errorUnmountApp(e, appInfo) {
        expect(i).toBe(1);
        expect(arguments.length).toBe(2);
        expect(appInfo === app.appInfo).toBe(true);
        expect(e).toBe('test error');
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            i++;
            resolve();
          });
        });
      },
    });

    garfish.on('errorUnmountApp', function (_app, e) {
      expect(i).toBe(0);
      expect(arguments.length).toBe(2);
      expect(_app === app).toBe(true);
      expect(e).toBe('test error');
      i++;
    });

    (app as any).callDestroy = function () {
      throw 'test error';
    };

    await app.mount();
    expect(app.context.activeApps.length).toBe(1);

    const res = await app.unmount();
    expect(res).toBe(false);
    expect((app as any).unmounting).toBe(false);
    expect(i).toBe(2);
    expect(app.context.activeApps.length).toBe(0);
    expect(app.appContainer.parentNode).not.toBe(null);
  });

  it('compile', async () => {
    const app = await garfish.loadApp('app');
    expect(app.compile.length).toBe(1);

    const spySbActive = jest.spyOn(app, 'sandBoxActive');
    const spyCrtContainer = jest.spyOn(app as any, 'createContainer');

    let provider = await app.getProvider();
    expect(provider).toBe(undefined);
    const res = await app.compile(true);
    expect(res).toBe(true);
    provider = await app.getProvider();
    expect(typeof provider).toBe('object');
    expect(spyCrtContainer.mock.calls.length).toBe(1);
    expect(spySbActive.mock.calls.length > 0).toBe(true);

    spySbActive.mockRestore();
    spyCrtContainer.mockRestore();
  });

  it('compile [prevent]', async () => {
    const app = await garfish.loadApp('app');

    let provider = await app.getProvider();
    expect(provider).toBe(undefined);
    const process = app.compile(true);
    app.hide();
    const res = await process;
    expect(res).toBe(false);
    provider = await app.getProvider();
    expect(provider).toBe(undefined);
  });

  it('compile [no genProvider]', async () => {
    const app = await garfish.loadApp('app');
    const spySbActive = jest.spyOn(app, 'sandBoxActive');
    const spyCrtContainer = jest.spyOn(app as any, 'createContainer');

    let provider = await app.getProvider();
    expect(provider).toBe(undefined);
    const res = await app.compile();
    expect(res).toBe(true);
    provider = await app.getProvider();
    expect(provider).toBe(undefined);
    expect(spyCrtContainer.mock.calls.length).toBe(1);
    expect(spySbActive.mock.calls.length > 0).toBe(true);

    spySbActive.mockRestore();
    spyCrtContainer.mockRestore();
  });

  it('compile [hooks]', async () => {
    let i = 0;
    const app = await garfish.loadApp('app', {
      beforeEval(appInfo, basename) {
        expect(i).toBe(0);
        expect(appInfo === app.appInfo).toBe(true);
        expect(basename === app.options.basename).toBe(true);
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            i++;
            resolve();
          });
        });
      },
      afterEval(appInfo, basename) {
        expect(i).toBe(1);
        expect(appInfo === app.appInfo).toBe(true);
        expect(basename === app.options.basename).toBe(true);
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            i++;
            resolve();
          });
        });
      },
    });

    await app.compile();
    expect(i).toBe(2);
  });

  it('compile [hooks prevent]', async () => {
    const app = await garfish.loadApp('app', {
      beforeEval() {
        app.hide();
      },
    });

    let provider = await app.getProvider();
    expect(provider).toBe(undefined);
    const res = await app.compile(true);
    expect(res).toBe(false);
    provider = await app.getProvider();
    expect(provider).toBe(undefined);
  });

  it('compile [window.onload]', async () => {
    let called = false;
    const app = await garfish.loadApp('app');
    app.execScript(`window.onload = function() {
      throw 'onload error';
    }`);

    try {
      await app.compile();
    } catch (e) {
      called = true;
      expect(e).toBe('onload error');
    }
    expect(called).toBe(true);
  });
});
