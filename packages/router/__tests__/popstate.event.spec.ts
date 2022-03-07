import Router, { listenRouterAndReDirect } from '../src/context';
import { interfaces } from '@garfish/core';

describe('Router: test index', () => {
  let activeInfo: interfaces.AppInfo = {
    name: '',
    activeWhen: '',
    entry: '',
  };

  let deactiveApp = null;
  const mockPopEventFn = jest.fn();

  const options = {
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
    listenRouterAndReDirect(options);
    window.addEventListener('popstate', mockPopEventFn);
  });

  it('Router: native navigation appA and autoRefresh is false', async () => {
    window.history.pushState(null, null, '/a');
    await waitSwitchReady();
    expect(activeInfo.name).toBe('appA');
  });

  it('Router: autoRefresh subApp', async () => {
    Router.push({ path: '/a/b' });
    await waitSwitchReady();
    expect(mockPopEventFn.mock.calls.length).toBe(1);
  });

  it('Router: when autoRefresh with false subApp not to refresh', async () => {
    history.pushState(null, '', '/a/c');
    await waitSwitchReady();
    expect(mockPopEventFn.mock.calls.length).toBe(0); // not call
  });

  it('Router: when autoRefresh with true subApp refresh', async () => {
    Router.setRouterConfig({
      autoRefreshApp: true,
    });
    history.pushState(null, '', '/a/d');
    await waitSwitchReady();
    expect(mockPopEventFn.mock.calls.length).toBe(1); // not call
  });
});
