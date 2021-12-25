import Router, { listenRouterAndReDirect } from '../src/context';
import { interfaces } from '@garfish/core';
import { CurrentRouterInfo } from '../src/config';

describe('Router: test guard', () => {
  let activeInfo: interfaces.AppInfo = {
    name: '',
    activeWhen: '',
    entry: '',
  };

  let deactiveApp = null;
  let afterGuardToInfo: CurrentRouterInfo;
  let afterGuardFromInfo: CurrentRouterInfo;
  let beforeGuardToInfo: CurrentRouterInfo;
  let beforeGuardFromInfo: CurrentRouterInfo;
  const basename = '/garfish-demo';
  const mockPopEventFn = jest.fn();

  const options = {
    basename,
    apps: [
      {
        name: 'appA',
        activeWhen: '/a',
        entry: 'https://baidu.com',
        basename: '/',
      },
      {
        name: 'appB',
        activeWhen: '/b',
        entry: 'https://google.com',
        basename: '/',
      },
    ],
    autoRefreshApp: false,
    notMatch: () => {},
    active: async (appInfo) => {
      activeInfo = appInfo;
    },
    deactive: async (appInfo) => {
      deactiveApp = appInfo;
    },
  };

  const waitSwitchReady = function () {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      });
    });
  };

  beforeAll(() => {
    Router.afterEach((to, from, next) => {
      afterGuardToInfo = to;
      afterGuardFromInfo = from;
      next();
    });
    Router.beforeEach((to, from, next) => {
      beforeGuardToInfo = to;
      beforeGuardFromInfo = from;
      next();
    });
    listenRouterAndReDirect(options);
    window.addEventListener('popstate', mockPopEventFn);
  });

  it('Router: native navigation appA judge to and from path', async () => {
    history.pushState(null, null, `${basename}/a`);
    await waitSwitchReady();
    expect(afterGuardToInfo.path).toBe('/a');
    expect(afterGuardToInfo.fullPath).toBe(`${basename}/a`);
    expect(afterGuardFromInfo.path).toBe('/');
    expect(afterGuardFromInfo.fullPath).toBe('/');

    expect(beforeGuardToInfo.path).toBe('/a');
    expect(beforeGuardToInfo.fullPath).toBe(`${basename}/a`);
    expect(beforeGuardFromInfo.path).toBe('/');
    expect(beforeGuardFromInfo.fullPath).toBe('/');
  });

  it('Router: router push judge to and from path', async () => {
    Router.push({ path: '/a/b' });
    await waitSwitchReady();
    expect(afterGuardToInfo.path).toBe('/a/b');
    expect(afterGuardToInfo.fullPath).toBe(`${basename}/a/b`);
    expect(afterGuardFromInfo.path).toBe('/a');
    expect(afterGuardFromInfo.fullPath).toBe(`${basename}/a`);

    expect(beforeGuardToInfo.path).toBe('/a/b');
    expect(beforeGuardToInfo.fullPath).toBe(`${basename}/a/b`);
    expect(beforeGuardFromInfo.path).toBe('/a');
    expect(beforeGuardFromInfo.fullPath).toBe(`${basename}/a`);
  });

  it('Router: native navigation appB judge to and from path', async () => {
    history.pushState(null, '', `${basename}/a/c`);
    await waitSwitchReady();
    expect(afterGuardToInfo.path).toBe('/a/c');
    expect(afterGuardToInfo.fullPath).toBe(`${basename}/a/c`);
    expect(afterGuardFromInfo.path).toBe('/a/b');
    expect(afterGuardFromInfo.fullPath).toBe(`${basename}/a/b`);

    expect(beforeGuardToInfo.path).toBe('/a/c');
    expect(beforeGuardToInfo.fullPath).toBe(`${basename}/a/c`);
    expect(beforeGuardFromInfo.path).toBe('/a/b');
    expect(beforeGuardFromInfo.fullPath).toBe(`${basename}/a/b`);
  });
});
