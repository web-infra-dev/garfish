import Router, { listenRouterAndReDirect } from '../src/context';
import { interfaces } from '@garfish/core';

describe('Router: test router methods', () => {
  let activeInfo: interfaces.AppInfo = {
    name: '',
    activeWhen: '',
    entry: '',
  };
  let deactiveApp = null;

  const options = {
    apps: [
      {
        name: 'appA',
        activeWhen: '/a',
        entry: 'https://baidu.com',
      },
      {
        name: 'appB',
        activeWhen: '/b',
        entry: 'https://google.com',
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

  beforeAll(() => {
    listenRouterAndReDirect(options);
  });

  const waitSwitchReady = function () {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      });
    });
  };

  it('Router: native navigation appA and push query', async () => {
    Router.push({ path: '/a', query: { name: 'queryA' } });
    await waitSwitchReady();
    expect(activeInfo.name).toBe('appA');
    expect(window.location.pathname + window.location.search).toBe(
      '/a?name=queryA',
    );
  });

  it('Router: native navigation appB and push query', async () => {
    Router.replace({ path: '/b', query: { name: 'queryB' } });
    await waitSwitchReady();
    expect(activeInfo.name).toBe('appB');
    expect(window.location.pathname + window.location.search).toBe(
      '/b?name=queryB',
    );
  });
});
