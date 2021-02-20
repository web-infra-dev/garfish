import { Garfish } from '../src/garfish';
import { createGarfish, mockHtmlEntry } from './testUtils';

describe('Garfish router', () => {
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

  it('startRouter', () => {
    jest.mock('@garfish/router', () => {
      return {
        __esModule: true,
        listenRouterAndReDirect(obj) {
          expect(arguments.length).toBe(1);
          // 许增不许删
          [
            'active',
            'deactive',
            'autoRefreshApp',
            'notMatch',
            'basename',
            'apps',
          ].forEach((n) => {
            expect(n in obj).toBe(true);
          });
        },
      };
    });
    const { startRouter } = require('../src/router');
    expect(startRouter.length).toBe(1);
    startRouter(garfish);
  });

  it('Check active and deactive', (done) => {
    console.error = () => {};
    const appInfos = [
      {
        name: 'app1',
        entry: './',
      },
      {
        name: 'app2',
        entry: './',
      },
    ];
    jest.mock('@garfish/router', () => {
      return {
        __esModule: true,
        async listenRouterAndReDirect(obj) {
          const { active, deactive } = obj;
          expect(Object.keys(garfish.apps).length).toBe(0);

          // 这里不需要检查是否加载成功
          await active(appInfos[0], '/test');
          expect(Object.keys(garfish.apps).length).toBe(1);
          expect('app1' in garfish.apps).toBe(true);

          // 重复加载
          await active(appInfos[0], '/test');
          expect(Object.keys(garfish.apps).length).toBe(1);
          expect('app1' in garfish.apps).toBe(true);

          await active(appInfos[1], '/test');
          expect(Object.keys(garfish.apps).length).toBe(2);
          expect('app1' in garfish.apps).toBe(true);
          expect('app2' in garfish.apps).toBe(true);

          await deactive(appInfos[1], '/test');
          expect(Object.keys(garfish.apps).length).toBe(1);
          expect('app1' in garfish.apps).toBe(true);
          expect('app2' in garfish.apps).toBe(false);

          await deactive(appInfos[0], '/test');
          expect(Object.keys(garfish.apps).length).toBe(0);
          expect('app1' in garfish.apps).toBe(false);
          expect('app2' in garfish.apps).toBe(false);

          done();
        },
      };
    });

    const { startRouter } = require('../src/router');
    garfish.registerApp(appInfos);
    startRouter(garfish);
  });

  it('Check custom active and deactive', (done) => {
    const appInfos = [
      {
        name: 'app',
        entry: './',
        active: null,
        deactive: null,
      },
    ];
    jest.mock('@garfish/router', () => {
      return {
        __esModule: true,
        async listenRouterAndReDirect(obj) {
          let calledCount = 0;
          const { active, deactive } = obj;

          expect(Object.keys(garfish.apps).length).toBe(0);

          appInfos[0].active = function (info, root) {
            expect(arguments.length).toBe(2);
            expect(info === appInfos[0]).toBe(true);
            expect(root).toBe('/test');
            calledCount++;
          };

          appInfos[0].deactive = function (info, root) {
            expect(arguments.length).toBe(2);
            expect(info === appInfos[0]).toBe(true);
            expect(root).toBe('/test');
            calledCount++;
          };

          await active(appInfos[0], '/test');
          expect(Object.keys(garfish.apps).length).toBe(0);
          expect('app' in garfish.apps).toBe(false);
          expect(calledCount).toBe(1);

          await deactive(appInfos[0], '/test');
          expect(calledCount).toBe(2);

          done();
        },
      };
    });

    const { startRouter } = require('../src/router');
    garfish.registerApp(appInfos);
    startRouter(garfish);
  });

  it('Call app mount or show [noCache]', (done) => {
    const appInfos = [
      {
        name: 'app',
        entry: mockHtmlEntry,
      },
    ];
    const { App } = require('../src/module/app');
    const spyAppShow = jest.spyOn(App.prototype, 'show');
    const spyAppMount = jest.spyOn(App.prototype, 'mount');
    const spyAppHide = jest.spyOn(App.prototype, 'hide');
    const spyAppUnmount = jest.spyOn(App.prototype, 'unmount');

    jest.mock('@garfish/router', () => {
      return {
        __esModule: true,
        async listenRouterAndReDirect(obj) {
          const { active, deactive } = obj;

          await active(appInfos[0], '/test');
          expect(typeof garfish.apps.app).toBe('object');
          expect(spyAppShow.mock.calls.length).toBe(0);
          expect(spyAppMount.mock.calls.length).toBe(1);

          await active(appInfos[0], '/test');
          expect(spyAppShow.mock.calls.length).toBe(0);
          expect(spyAppMount.mock.calls.length).toBe(2);

          await deactive(appInfos[0], '/test');
          expect(spyAppHide.mock.calls.length).toBe(0);
          expect(spyAppUnmount.mock.calls.length).toBe(1);

          await deactive(appInfos[0], '/test');
          expect(spyAppHide.mock.calls.length).toBe(0);
          expect(spyAppUnmount.mock.calls.length).toBe(2);

          spyAppShow.mockRestore();
          spyAppMount.mockRestore();
          spyAppHide.mockRestore();
          spyAppUnmount.mockRestore();

          done();
        },
      };
    });

    const { Garfish } = require('../src/garfish');
    const { startRouter } = require('../src/router');
    const garfish = new Garfish();

    garfish.registerApp(appInfos);
    garfish.setOptions({ domGetter: () => appWraper });
    startRouter(garfish);
  });

  it('Call app mount or show [cache]', (done) => {
    const appInfos = [
      {
        name: 'app',
        cache: true,
        entry: mockHtmlEntry,
      },
    ];
    const { App } = require('../src/module/app');
    const spyAppShow = jest.spyOn(App.prototype, 'show');
    const spyAppMount = jest.spyOn(App.prototype, 'mount');
    const spyAppHide = jest.spyOn(App.prototype, 'hide');
    const spyAppUnmount = jest.spyOn(App.prototype, 'unmount');

    jest.mock('@garfish/router', () => {
      return {
        __esModule: true,
        async listenRouterAndReDirect(obj) {
          const { active, deactive } = obj;

          await active(appInfos[0], '/test');
          expect(typeof garfish.apps.app).toBe('object');
          expect(spyAppShow.mock.calls.length).toBe(0);
          expect(spyAppMount.mock.calls.length).toBe(1);

          await active(appInfos[0], '/test');
          expect(spyAppShow.mock.calls.length).toBe(1);
          expect(spyAppMount.mock.calls.length).toBe(1);

          await deactive(appInfos[0], '/test');
          expect(spyAppHide.mock.calls.length).toBe(1);
          expect(spyAppUnmount.mock.calls.length).toBe(0);

          await deactive(appInfos[0], '/test');
          expect(spyAppHide.mock.calls.length).toBe(2);
          expect(spyAppUnmount.mock.calls.length).toBe(0);

          spyAppShow.mockRestore();
          spyAppMount.mockRestore();
          spyAppHide.mockRestore();
          spyAppUnmount.mockRestore();

          done();
        },
      };
    });

    const { Garfish } = require('../src/garfish');
    const { startRouter } = require('../src/router');
    const garfish = new Garfish();

    garfish.registerApp(appInfos);
    garfish.setOptions({ domGetter: () => appWraper });
    startRouter(garfish);
  });
});
