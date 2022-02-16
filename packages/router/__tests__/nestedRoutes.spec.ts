import Router, { listenRouterAndReDirect } from '../src/context';
import { interfaces } from '@garfish/core';

describe('Router: test active and refreshApp', () => {
  let activeInfos: Array<interfaces.AppInfo> = [];

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
        name: 'appSubAppA',
        activeWhen: '/subApp',
        entry: 'https://google.com',
        basename: '/a',
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
      activeInfos.push(appInfo);
    },
    deactive: async (appInfo) => {
      activeInfos = activeInfos.filter((app) => {
        return app.name !== appInfo.name;
      });
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

  it('Router nested: native navigation', async () => {
    window.history.pushState(null, null, '/a');
    await waitSwitchReady();
    expect(activeInfos.map((app) => app.name)).toEqual(['appA']);
  });

  it('Router nested: native navigation to appSubAppA', async () => {
    window.history.replaceState(null, null, '/a/subApp');
    await waitSwitchReady();
    expect(activeInfos.map((app) => app.name)).toEqual(['appA', 'appSubAppA']);
  });

  it('Router nested: use router navigation function to appB', async () => {
    Router.replace({ path: '/b' });
    await waitSwitchReady();
    expect(activeInfos.map((app) => app.name)).toEqual(['appB']);
  });

  it('Router: autoRefresh subApp', async () => {
    Router.replace({ path: '/a' });
    await waitSwitchReady();
    expect(activeInfos.map((app) => app.name)).toEqual(['appA']);
    expect(mockPopEventFn.mock.calls.length).toBe(1);
  });
});
