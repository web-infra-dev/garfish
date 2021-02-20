import { Garfish } from '../src/garfish';
import { createGarfish } from './testUtils';

describe('Garfish preloadApp', () => {
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
    jest.resetModules();
  });

  it('Block loading on mobile [Android]', (done) => {
    const userAgent = navigator.userAgent;
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Android',
      configurable: true,
    });

    const { preloadApp, loadAppResource } = require('../src/preloadApp');
    let called = false;
    (loadAppResource as any)._oncalled = function () {
      called = true;
    };

    preloadApp(garfish);
    garfish.registerApp({
      name: 'app',
      entry: './',
    });

    setTimeout(() => {
      expect(called).toBe(false);
      delete (loadAppResource as any)._oncalled;
      Object.defineProperty(navigator, 'userAgent', {
        value: userAgent,
        configurable: true,
      });
      done();
    });
  });

  it('Block loading on mobile [iPhone]', (done) => {
    const userAgent = navigator.userAgent;
    Object.defineProperty(navigator, 'userAgent', {
      value: 'iPhone',
      configurable: true,
    });

    const { preloadApp, loadAppResource } = require('../src/preloadApp');
    let called = false;
    (loadAppResource as any)._oncalled = function () {
      called = true;
    };

    preloadApp(garfish);
    garfish.registerApp({
      name: 'app',
      entry: './',
    });

    setTimeout(() => {
      expect(called).toBe(false);
      delete (loadAppResource as any)._oncalled;
      Object.defineProperty(navigator, 'userAgent', {
        value: userAgent,
        configurable: true,
      });
      done();
    });
  });

  it('Block loading on slow network [2g]', (done) => {
    (navigator as any).connection = { effectiveType: '2g' };
    const { preloadApp, loadAppResource } = require('../src/preloadApp');
    let called = false;
    (loadAppResource as any)._oncalled = function () {
      called = true;
    };

    preloadApp(garfish);
    garfish.registerApp({
      name: 'app',
      entry: './',
    });

    setTimeout(() => {
      expect(called).toBe(false);
      delete (navigator as any).connection;
      delete (loadAppResource as any)._oncalled;
      done();
    });
  });

  it('Block loading on slow network [3g]', (done) => {
    (navigator as any).connection = { effectiveType: '3g' };
    const { preloadApp, loadAppResource } = require('../src/preloadApp');
    let called = false;
    (loadAppResource as any)._oncalled = function () {
      called = true;
    };

    preloadApp(garfish);
    garfish.registerApp({
      name: 'app',
      entry: './',
    });

    setTimeout(() => {
      expect(called).toBe(false);
      delete (navigator as any).connection;
      delete (loadAppResource as any)._oncalled;
      done();
    });
  });

  it('Block loading on slow network [saveData]', (done) => {
    (navigator as any).connection = { saveData: true };
    const { preloadApp, loadAppResource } = require('../src/preloadApp');
    let called = false;
    (loadAppResource as any)._oncalled = function () {
      called = true;
    };

    preloadApp(garfish);
    garfish.registerApp({
      name: 'app',
      entry: './',
    });

    setTimeout(() => {
      expect(called).toBe(false);
      delete (navigator as any).connection;
      delete (loadAppResource as any)._oncalled;
      done();
    });
  });

  it('Catch request error', (done) => {
    const { warn } = require('@garfish/utils');
    const { preloadApp, requestQueue } = require('../src/preloadApp');
    let calledWarn = false;
    console.error = () => {};
    const nativeError = console.error; // 错误已经被捕获不需要 log
    const spyAdd = jest.spyOn(requestQueue, 'add');

    const res = preloadApp(garfish);
    expect(res).toBeUndefined();
    expect(preloadApp.length).toBe(1);

    (warn as any)._oncalled = function () {
      calledWarn = true;
    };

    garfish.registerApp({
      name: 'app',
      entry: './',
    });

    setTimeout(() => {
      expect(spyAdd.mock.calls.length).toBe(1);
      expect(typeof spyAdd.mock.calls[0][0]).toBe('function');
      expect(calledWarn).toBe(true);

      console.error = nativeError;
      delete (warn as any)._oncalled;
      spyAdd.mockRestore();
      done();
    }, 500);
  });

  it('Start after 5s', (done) => {
    const { preloadApp, loadAppResource } = require('../src/preloadApp');
    let callCount = 0;
    const orderInfos = [];
    (loadAppResource as any)._oncalled = function (info) {
      callCount++;
      orderInfos.push(info);
    };

    preloadApp(garfish);
    garfish.registerApp({
      name: 'app',
      entry: './',
    });

    expect(callCount).toBe(0);
    expect(orderInfos.length).toBe(0);
    // 测试环境下，启动时间缩短为 0s，但还是在宏任务中
    setTimeout(() => {
      expect(callCount).toBe(1);
      expect(orderInfos).toEqual([
        {
          name: 'app',
          entry: './',
        },
      ]);
      delete (loadAppResource as any)._oncalled;
      done();
    });
  });

  it('requestQueue', (done) => {
    const { requestQueue } = require('../src/preloadApp');
    let i = 0;

    expect(requestQueue.add.length).toBe(1);

    const fn = (next) => {
      setTimeout(() => {
        i++;
        next();
      });
    };

    requestQueue.add(fn);
    requestQueue.add(fn);
    requestQueue.add(fn);

    expect(i).toBe(0);
    setTimeout(() => {
      expect(i).toBe(1);
      setTimeout(() => {
        expect(i).toBe(2);
        setTimeout(() => {
          expect(i).toBe(3);
          done();
        });
      });
    });
  });

  it('Rank cache', () => {
    const { getRanking, setRanking } = require('../src/preloadApp');
    const curRank = getRanking();

    expect(Array.isArray(curRank)).toBe(true);
    expect(curRank.length).toBe(0);

    setRanking('app1');

    expect(getRanking()).toEqual([
      {
        appName: 'app1',
        count: 1,
      },
    ]);

    setRanking('app2');

    expect(getRanking()).toEqual([
      {
        appName: 'app1',
        count: 1,
      },
      {
        appName: 'app2',
        count: 1,
      },
    ]);

    setRanking('app2');

    expect(getRanking()).toEqual([
      {
        appName: 'app2',
        count: 2,
      },
      {
        appName: 'app1',
        count: 1,
      },
    ]);

    setRanking('app1');

    expect(getRanking()).toEqual([
      {
        appName: 'app1',
        count: 2,
      },
      {
        appName: 'app2',
        count: 2,
      },
    ]);

    setRanking('app1');

    expect(getRanking()).toEqual([
      {
        appName: 'app1',
        count: 3,
      },
      {
        appName: 'app2',
        count: 2,
      },
    ]);

    localStorage.clear();
  });

  it('Ranking first', (done) => {
    const {
      preloadApp,
      setRanking,
      loadAppResource,
    } = require('../src/preloadApp');
    const order = [];
    preloadApp(garfish);
    setRanking('app2');

    (loadAppResource as any)._oncalled = function (info) {
      order.push(info);
    };

    garfish.registerApp([
      {
        name: 'app1',
        entry: './',
      },
      {
        name: 'app2',
        entry: './',
      },
    ]);

    setTimeout(() => {
      expect(order.length).toBe(2);
      expect(order[0].name).toBe('app2');
      expect(order[1].name).toBe('app1');
      localStorage.clear();
      delete (loadAppResource as any)._oncalled;
      done();
    });
  });
});
