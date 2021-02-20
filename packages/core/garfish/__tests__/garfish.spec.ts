import { Garfish } from '../src/garfish';
import { startRouter } from '../src/router';
import { BOOTSTRAP, BEFORE_BOOTSTRAP, REGISTER_APP } from '../src/eventTypes';
import {
  isObject,
  isAsyncError,
  createGarfish,
  mockHtmlEntry,
} from './testUtils';

describe('Garfish index', () => {
  let props;
  let garfish: Garfish;
  let appWraper: HTMLDivElement;

  beforeEach(() => {
    props = {};
    appWraper = document.createElement('div');
    garfish = createGarfish({
      props,
      domGetter: () => appWraper,
    });
  });

  it('Instance id increment', () => {
    expect(createGarfish().id).toBe(1);
    expect(createGarfish().id).toBe(2);
  });

  it('Check public attributes', () => {
    expect(garfish.running).toBe(false);
    expect(isObject(garfish.apps)).toBe(true);
    expect(isObject(garfish.loader)).toBe(true);
    expect(isObject(garfish.router)).toBe(true);
    expect(isObject(garfish.options)).toBe(true);
    expect(isObject(garfish.channel)).toBe(true);
    expect(isObject(garfish.appInfos)).toBe(true);
    expect(isObject(garfish.externals)).toBe(true);
    expect(isObject(garfish.activeApps)).toBe(true);
    expect(typeof garfish.version).toBe('string');

    expect(garfish.props).toEqual(props);
    expect(() => ((garfish as any).props = {})).toThrow();
  });

  it('Check public methods', () => {
    [
      'run',
      'use',
      'setOptions',
      'setExternal',
      'registerApp',
      'loadApp',
      'preloadApp',
      'setGlobalValue',
      'getGlobalObject',
      'clearEscapeEffect',
    ].forEach((n) => {
      expect(typeof garfish[n]).toBe('function');
    });
  });

  it('Method: Garfish.run', () => {
    let callStartRouter, calledBootstrap, callBeforeBootstrap;
    garfish.on(BEFORE_BOOTSTRAP, (options) => {
      callBeforeBootstrap = true;
      options.changedOpts = true;
      expect(isObject(options)).toBe(true);
    });

    garfish.on(BOOTSTRAP, (options) => {
      calledBootstrap = true;
      expect(isObject(options)).toBe(true);
      expect(options.changedOpts).toBe(true);
      delete options.changedOpts;
    });

    (startRouter as any)._oncalled = () => {
      callStartRouter = true;
    };

    expect(garfish.running).toBe(false);
    const spySetOpts = jest.spyOn(garfish, 'setOptions');
    const spyRegister = jest.spyOn(garfish, 'registerApp');

    const result = garfish.run({
      apps: [],
      domGetter: () => appWraper,
    });

    const endOptions = {
      apps: [],
      domGetter: () => appWraper,
      insulationVariable: ['onerror', 'webpackjsonp', 'webpackHotUpdate'],
    };

    expect(result === garfish).toBe(true);
    expect(garfish.run.length).toBe(1);
    expect(garfish.running).toBe(true);
    expect(callStartRouter).toBe(true);
    expect(calledBootstrap).toBe(true);
    expect(callBeforeBootstrap).toBe(true);
    expect(garfish.appInfos).toEqual({});
    expect('changedOpts' in garfish.options).toBe(false);
    expect(garfish.options.insulationVariable).toEqual(
      endOptions.insulationVariable,
    );

    // 重复调用，直接返回 this
    expect(garfish.run() === garfish).toBe(true);

    // 相关联的函数调用检测
    expect(spySetOpts.mock.calls.length).toBe(1);
    expect(spySetOpts.mock.calls[0].length).toBe(1);
    // @ts-ignore
    expect(spySetOpts.mock.calls[0][0].changedOpts).toBe(true);
    expect(spyRegister.mock.calls.length).toBe(1);
    expect(spyRegister.mock.calls[0].length).toBe(1);
    expect(spyRegister.mock.calls[0][0]).toEqual(endOptions.apps);

    // 重复调用

    spySetOpts.mockRestore();
    spyRegister.mockRestore();
    delete (startRouter as any)._oncalled;
  });

  it('Method: Garfish.setOptions', () => {
    const result = garfish.setOptions({ appID: 'testAppId' });
    expect(result === garfish).toBe(true);
    expect(garfish.setOptions.length).toBe(1);
    expect(garfish.options.appID).toBe('testAppId');
    expect(() => {
      garfish.running = true;
      garfish.setOptions({} as any);
    }).toThrow();
  });

  it('Method: Garfish.use', () => {
    expect(() => garfish.use({} as any)).toThrow();
    expect(() => garfish.use(1 as any)).toThrow();
    expect(() => garfish.use('1' as any)).toThrow();
    expect(() => garfish.use(true as any)).toThrow();
    expect(() => garfish.use(null as any)).toThrow();
    expect(() => garfish.use(undefined as any)).toThrow();

    const testPlugin = jest.fn();
    const resOne = garfish.use(testPlugin, 1, 2);
    const resTwo = garfish.use(testPlugin, 3, 4);

    expect(resOne).toBe(garfish);
    expect(resTwo).toBe(garfish);
    expect(testPlugin.mock.calls.length).toBe(1);
    expect(testPlugin.mock.calls[0][0]).toBe(garfish);
    expect(testPlugin.mock.calls[0][1]).toBe(1);
    expect(testPlugin.mock.calls[0][2]).toBe(2);
    expect(testPlugin.mock.instances[0]).toBe(null);
  });

  it('Method: Garfish.setExternal', () => {
    expect(garfish.setExternal.length).toBe(2);
    expect(() => garfish.setExternal('')).toThrow();
    expect(() => garfish.setExternal(null)).toThrow();
    expect(() => garfish.setExternal(undefined)).toThrow();
    expect(() => garfish.setExternal(false as any)).toThrow();

    const externalObject = garfish.externals;
    const result = garfish.setExternal('app1', null);

    expect(result).toBe(garfish);
    expect(Object.keys(garfish.externals).length).toBe(1);
    expect(garfish.externals === externalObject).toBe(true);

    const externalObjectTwo = {
      app1: 1,
      app2: 2,
    };

    garfish.setExternal(externalObjectTwo);
    expect(garfish.externals === externalObject).toBe(true);
    expect(garfish.externals !== externalObjectTwo).toBe(true);
    expect(garfish.externals).toEqual({
      app1: 1,
      app2: 2,
    });

    garfish.setExternal({ app1: 2 });
    expect(garfish.externals === externalObject).toBe(true);
    expect(garfish.externals !== externalObjectTwo).toBe(true);
    expect(garfish.externals).toEqual({
      app1: 2,
      app2: 2,
    });
  });

  it('Method: Garfish.registerApp [1]', () => {
    expect(garfish.registerApp.length).toBe(1);
    expect(() => garfish.registerApp({ entry: '' } as any)).toThrow();

    const cb = jest.fn();
    garfish.on(REGISTER_APP, cb);

    garfish.registerApp({
      name: 'app1',
      entry: '1',
    });

    const result = garfish.registerApp([
      {
        name: 'app1',
        entry: '2',
      },
      {
        name: 'app2',
        entry: '2',
      },
    ]);

    expect(result === garfish).toBe(true);
    expect(cb.mock.calls.length).toBe(2);
    expect(cb.mock.calls[0][0]).toEqual({
      app1: {
        name: 'app1',
        entry: '1',
      },
    });
    expect(cb.mock.calls[1][0]).toEqual({
      app2: {
        name: 'app2',
        entry: '2',
      },
    });
  });

  it('Method: Garfish.preloadApp', () => {
    garfish.registerApp([
      {
        name: 'app1',
        entry: '',
      },
      {
        name: 'app2',
        entry: null,
      },
      {
        name: 'app3',
        entry: false as any,
      },
      {
        name: 'app4',
        entry: './',
      },
    ]);
    expect(garfish.preloadApp.length).toBe(1);
    expect(() => garfish.preloadApp('')).toThrow();
    expect(() => garfish.preloadApp('app1')).toThrow();
    expect(() => garfish.preloadApp('app2')).toThrow();
    expect(() => garfish.preloadApp('app3')).toThrow();

    const result = garfish.preloadApp('app4');
    expect(result === garfish).toBe(true);
  });

  // 这里只检测方法的行为，更严格的校验在沙箱里面测试
  it('Method: Garfish.getGlobalObject', () => {
    expect(garfish.getGlobalObject.length).toBe(0);
    expect(garfish.getGlobalObject() === window).toBe(true);
  });

  it('Method: Garfish.setGlobalObject', () => {
    garfish.setGlobalValue(null, 1);
    garfish.setGlobalValue('testKey1', 1);
    const result = garfish.setGlobalValue('testKey2');

    expect(garfish.setGlobalValue.length).toBe(2);
    expect(result === garfish).toBe(true);
    expect((window as any).null).toBe(1);
    expect((window as any).testKey1).toBe(1);
    expect((window as any).testKey2).toBe(undefined);

    delete (window as any).null;
    delete (window as any).testKey1;
    delete (window as any).testKey2;
  });

  it('Method: Garfish.clearEscapeEffect', () => {
    (window as any).testKey1 = 1;
    (window as any).testKey2 = 2;
    garfish.clearEscapeEffect('testKey1', null);
    garfish.clearEscapeEffect('testKey2');
    garfish.clearEscapeEffect(null, null);
    const result = garfish.clearEscapeEffect('testKey3', null);

    expect(garfish.clearEscapeEffect.length).toBe(2);
    expect(result === garfish).toBe(true);
    expect((window as any).null).toBe(undefined);
    expect((window as any).testKey1).toBe(null);
    expect((window as any).testKey2).toBe(undefined);
    expect((window as any).testKey3).toBe(undefined);

    delete (window as any).null;
    delete (window as any).testKey1;
    delete (window as any).testKey2;
    delete (window as any).testKey3;
  });

  it('Method: Garfish.loadApp [start error]', async () => {
    garfish.registerApp({ name: 'app' } as any);
    expect(garfish.loadApp.length).toBe(2);
    expect(await isAsyncError(() => garfish.loadApp(''))).toBe(true);
    expect(await isAsyncError(() => garfish.loadApp('app'))).toBe(true);
  });

  it('Method: Garfish.loadApp [options]', async () => {
    console.error = () => {};
    garfish.setOptions({
      basename: './a',
      sandbox: {
        hooks: {},
        modules: {},
      },
    });
    garfish.registerApp({
      name: 'app',
      entry: mockHtmlEntry,
    });

    const app = await garfish.loadApp('app', {
      basename: './b',
    });
    expect(app.options === garfish.options).toBe(false);
    expect(app.options).toMatchObject({
      ...garfish.options,
      basename: './b',
    });
  });

  it('Method: Garfish.loadApp [hooks]', async () => {
    console.error = () => {};
    let order = 0;
    const appInfo = {
      name: 'app',
      entry: mockHtmlEntry,
    };
    garfish.registerApp(appInfo);

    garfish.on('beforeLoadApp', function (appInfo, opts) {
      expect(order).toBe(1);
      expect(arguments.length).toBe(2);
      expect(appInfo === appInfo).toBe(true);
      expect(isObject(opts)).toBe(true);
      order++;
    });

    garfish.on('startLoadApp', function (appInfo) {
      expect(order).toBe(2);
      expect(arguments.length).toBe(1);
      expect(appInfo === appInfo).toBe(true);
      order++;
    });

    garfish.on('endLoadApp', function (app) {
      expect(order).toBe(3);
      expect(arguments.length).toBe(1);
      expect(app.name).toBe('app');
      order++;
    });

    const app = await garfish.loadApp('app', {
      beforeLoad(appInfo, opts) {
        expect(order).toBe(0);
        expect(arguments.length).toBe(2);
        expect(appInfo === appInfo).toBe(true);
        expect(isObject(opts)).toBe(true);
        return new Promise((resolve) => {
          setTimeout(() => {
            order++;
            resolve();
          });
        });
      },
      afterLoad(appInfo, opts) {
        expect(order).toBe(4);
        expect(arguments.length).toBe(2);
        expect(appInfo === appInfo).toBe(true);
        expect(isObject(opts)).toBe(true);
        return new Promise((resolve) => {
          setTimeout(() => {
            order++;
            resolve();
          });
        });
      },
    });

    order++;
    expect(order).toBe(6);
    expect(app.name).toBe('app');
    expect((garfish as any).loading['app']).toBe(null);
  });

  it('Method: Garfish.loadApp [beforeLoad]', async () => {
    console.error = () => {};
    garfish.registerApp({
      name: 'app',
      entry: mockHtmlEntry,
    });

    const app1 = await garfish.loadApp('app', {
      beforeLoad: () => false,
    });
    const app2 = await garfish.loadApp('app', {
      beforeLoad: () => Promise.resolve(false),
    });
    expect(app1).toBe(null);
    expect(app2).toBe(null);
  });

  it('Method: Garfish.loadApp [no cache]', async () => {
    console.error = () => {};
    garfish.registerApp({
      name: 'app',
      entry: mockHtmlEntry,
    });

    let app1: any = garfish.loadApp('app');
    let app2: any = garfish.loadApp('app');
    app1 = await app1;
    app2 = await app2;
    expect(app1 !== null).toBe(true);
    expect(app1 === app2).toBe(false);

    const app3 = await garfish.loadApp('app');
    const app4 = await garfish.loadApp('app');
    expect(app3 !== null).toBe(true);
    expect(app3 === app4).toBe(false);
    expect(app3.name).toBe('app');
    expect(app4.name).toBe('app');
  });

  it('Method: Garfish.loadApp [cache]', async () => {
    console.error = () => {};
    garfish.registerApp({
      name: 'app',
      entry: mockHtmlEntry,
    });

    let app1: any = garfish.loadApp('app', { cache: true });
    let app2: any = garfish.loadApp('app', { cache: true });
    app1 = await app1;
    app2 = await app2;
    expect(app1 !== null).toBe(true);
    expect(app1 === app2).toBe(true);

    const app3 = await garfish.loadApp('app', { cache: true });
    const app4 = await garfish.loadApp('app', { cache: true });
    expect(app3 !== null).toBe(true);
    expect(app3 === app4).toBe(true);
    expect(app3.name).toBe('app');
    expect(app4.name).toBe('app');
  });

  it('Method: Garfish.loadApp [error]', async () => {
    console.error = () => {};
    let order = 0;
    const appInfo = {
      name: 'app',
      entry: './error.html', // 实际上没有这个入口
    };

    garfish.registerApp(appInfo);
    garfish.on('loadAppError', function (e) {
      order++;
      expect(arguments.length).toBe(1);
      expect(typeof e).toBe('object');
    });

    const app = await garfish.loadApp('app', {
      errorLoadApp(e, appInfo) {
        order++;
        expect(arguments.length).toBe(2);
        expect(typeof e).toBe('object');
        expect(appInfo).toMatchObject(appInfo);
      },
    });
    expect(order).toBe(2);
    expect(app).toBe(null);
  });
});
