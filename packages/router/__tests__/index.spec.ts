import Router, { listenRouterAndReDirect } from '../src/context';
import { interfaces } from '@garfish/core';

describe('Router: test active and refreshApp', () => {
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
    autoRefreshApp: true,
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

  it('Router: native navigation', async () => {
    window.history.pushState(null, '', '/a');
    await waitSwitchReady();
    expect(activeInfo.name).toBe('appA');
  });

  it('Router: native navigation to appB', async () => {
    window.history.replaceState(null, '', '/b');
    await waitSwitchReady();
    expect(activeInfo.name).toBe('appB');
  });

  it('Router: use router navigation function to appA', async () => {
    Router.push({ path: '/a' });
    await waitSwitchReady();
    expect(activeInfo.name).toBe('appA');
  });

  it('Router: use router navigation function to appB', async () => {
    Router.replace({ path: '/b' });
    await waitSwitchReady();
    expect(activeInfo.name).toBe('appB');
  });

  it('Router: autoRefresh subApp', async () => {
    Router.replace({ path: '/a' });
    await waitSwitchReady();
    expect(activeInfo.name).toBe('appA');
    expect(mockPopEventFn.mock.calls.length).toBe(1);
  });
});
