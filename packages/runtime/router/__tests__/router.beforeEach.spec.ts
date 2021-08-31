import Router, { listenRouterAndReDirect } from '../src/context';

describe('Router: test router methods', () => {
  let beforeEachToInfo = null;
  let beforeEachFromInfo = null;
  let afterEachToInfo = null;
  let afterEachFromInfo = null;

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
    active: async () => {},
    deactive: async () => {},
  };

  beforeAll(() => {
    Router.afterEach((to, from, next) => {
      afterEachToInfo = to;
      afterEachFromInfo = from;
      next();
    });
    Router.beforeEach((to, from, next) => {
      beforeEachToInfo = to;
      beforeEachFromInfo = from;
      next();
    });
    listenRouterAndReDirect(options);
  });

  const waitSwitchReady = function () {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      });
    });
  };

  it('Router: beforeEach args', async () => {
    Router.push({ path: '/a', query: { name: 'queryA' } });
    await waitSwitchReady();
    expect(beforeEachToInfo.path).toBe('/a');
    expect(beforeEachFromInfo.path).toBe('/');
    history.pushState(null, '', '/b/c');
    await waitSwitchReady();
    expect(beforeEachToInfo.path).toBe('/b/c');
    expect(beforeEachFromInfo.path).toBe('/a');
  });

  it('Router: afterEach args', async () => {
    Router.push({ path: '/ccc' });
    await waitSwitchReady();
    expect(afterEachToInfo.path).toBe('/ccc');
    expect(afterEachFromInfo.path).toBe('/b/c');
    history.pushState(null, '', '/bbb');
    await waitSwitchReady();
    expect(afterEachToInfo.path).toBe('/bbb');
    expect(afterEachFromInfo.path).toBe('/ccc');
  });
});
