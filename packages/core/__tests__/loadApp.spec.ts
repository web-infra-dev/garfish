import {
  __MockBody__,
  __MockHead__,
  __MockHtml__,
  appContainerId,
} from '@garfish/utils';
import { mockStaticServer } from '@garfish/test-suite';
import Garfish from '../src/index';
import assert from 'assert';

describe('Core: load process', () => {
  let GarfishInstance: Garfish;
  let container, app1, app2, app3;

  const vueSubAppEntry = './resources/vueApp.html';
  const reactSubAppEntry = './resources/reactApp.html';
  const vue3AppRenderNode = 'hello-world-vue3';
  const vue3SubAppEntry = './resources/vue3App.html';
  const asyncProviderApp = './resources/asyncProviderApp.html';

  mockStaticServer({
    baseDir: __dirname,
  });

  beforeEach(() => {
    container = document.createElement('div');
    container.setAttribute('id', 'container');
    document.body.appendChild(container);

    app1 = document.createElement('div');
    app1.setAttribute('id', 'app1');
    container.appendChild(app1);

    app2 = document.createElement('div');
    app2.setAttribute('id', 'app2');
    container.appendChild(app2);

    app3 = document.createElement('div');
    app3.setAttribute('id', 'app3');
    container.appendChild(app3);

    GarfishInstance = new Garfish({});
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('domGetter cssSelector', async () => {
    const app = await GarfishInstance.loadApp('vue-app', {
      entry: vueSubAppEntry,
      domGetter: '#container',
    });

    assert(app, 'app should be loaded');
    await app.mount();

    const appContainer = container.querySelector(`[id^=${appContainerId}]`);
    expect(appContainer.childNodes[0]).toMatchSnapshot();
  });

  it('domGetter cssSelector delay 2000ms can work normally', async () => {
    const container = document.createElement('div');
    setTimeout(() => {
      container.setAttribute('id', 'async-container');
      document.body.appendChild(container);
    }, 1000);

    const app = await GarfishInstance.loadApp('vue-app', {
      entry: vueSubAppEntry,
      domGetter: '#async-container',
    });

    assert(app, 'app should be loaded');
    await app.mount();

    const appContainer = container.querySelector(`[id^=${appContainerId}]`);
    assert(appContainer, 'app container should be loaded');
    expect(appContainer.childNodes[0]).toMatchSnapshot();

    app.unmount();
    document.body.removeChild(container);
  });

  it('domGetter cssSelector delay 3500ms throw error', async () => {
    const container = document.createElement('div');
    setTimeout(() => {
      container.setAttribute('id', 'delay-async-container');
      document.body.appendChild(container);
    }, 3500);

    const app = await GarfishInstance.loadApp('vue-app', {
      entry: vueSubAppEntry,
      domGetter: '#delay-async-container',
    });

    assert(app, 'app should be loaded');
    await expect(app.mount.bind(app)).rejects.toThrowError(/Invalid domGetter/);
  });

  it('domGetter is function', async () => {
    const app = await GarfishInstance.loadApp('vue-app', {
      entry: vueSubAppEntry,
      domGetter: () => document.querySelector('#container'),
    });

    assert(app, 'app should be loaded');
    await app.mount();

    const appContainer = container.querySelector(`[id^=${appContainerId}]`);
    expect(appContainer.childNodes[0]).toMatchSnapshot();
  });

  it('load error app', async () => {
    const container = document.createElement('div');
    container.setAttribute('id', 'container');
    document.body.appendChild(container);
    const app = await GarfishInstance.loadApp('vue-app', {
      entry: reactSubAppEntry,
      domGetter: () => document.querySelector('#container'),
    });

    assert(app, 'app should be loaded');
    await expect(app.mount()).rejects.toThrowError('test msg');

    document.body.removeChild(container);
  });

  it("throw error when provide an 'name' opts in options", async () => {
    await expect(GarfishInstance.loadApp('vue-app')).rejects.toThrow();
  });

  it('get the options from register info by default', async () => {
    GarfishInstance.run({
      domGetter: '#container',
      apps: [
        {
          name: 'vue-app',
          entry: vueSubAppEntry,
        },
      ],
    });

    await expect(GarfishInstance.loadApp('vue-app')).resolves.toMatchObject({
      appInfo: {
        entry: vueSubAppEntry,
      },
    });
  });

  it('config will be deepMerged with global config、register app info and provided by options in loadApp', async () => {
    GarfishInstance.run({
      basename: 'demo',
      domGetter: '#container',
      apps: [
        {
          name: 'vue-app',
          entry: vueSubAppEntry,
        },
      ],
    });

    await expect(
      GarfishInstance.loadApp('vue-app', {
        domGetter: '#container',
        entry: vueSubAppEntry,
      }),
    ).resolves.toMatchObject({
      appInfo: {
        basename: 'demo',
        entry: vueSubAppEntry,
      },
    });
  });

  it('config provided by options in loadApp will have the highest priority after config merged', async () => {
    const mockBeforeLoad = jest.fn((appInfo) => {
      appInfo.entry = vue3SubAppEntry;
    });

    GarfishInstance.run({
      beforeLoad: mockBeforeLoad,
      apps: [
        {
          name: 'vue-app',
          entry: vueSubAppEntry,
          basename: '/vue',
        },
      ],
    });

    await expect(
      GarfishInstance.loadApp('vue-app', {
        domGetter: '#container',
        props: {
          aaa: '123',
        },
      }),
    ).resolves.toMatchObject({
      appInfo: {
        entry: vue3SubAppEntry,
        props: {
          aaa: '123',
        },
      },
    });

    const app = await GarfishInstance.loadApp('vue-app', {
      entry: vue3SubAppEntry,
      domGetter: '#container',
    });

    assert(app, 'app should be loaded');
    await app.mount();

    const appContainer = container.querySelectorAll(`[id^=${appContainerId}]`);
    expect(appContainer).toHaveLength(1);
    expect(appContainer[0].querySelectorAll(`[${__MockHtml__}]`)).toHaveLength(
      1,
    );
    expect(appContainer[0].querySelectorAll(`[${__MockHead__}]`)).toHaveLength(
      1,
    );
    expect(appContainer[0].querySelectorAll(`[${__MockBody__}]`)).toHaveLength(
      1,
    );
    expect(
      appContainer[0].querySelectorAll(`[id=${vue3AppRenderNode}]`),
    ).toHaveLength(1);
    app.unmount();
    expect(container.querySelectorAll(`[id^=${appContainerId}]`)).toHaveLength(
      0,
    );
  });

  it('provide an entry after beforeLoad if entry is not provided in register', async () => {
    const mockBeforeLoad = jest.fn(() => {
      GarfishInstance.appInfos['vue-app'] = {
        name: 'vue-app',
        entry: vueSubAppEntry,
      };
    });

    GarfishInstance.run({
      beforeLoad: mockBeforeLoad,
    });

    await expect(
      GarfishInstance.loadApp('vue-app', {
        domGetter: '#container',
      }),
    ).resolves.toMatchObject({
      appInfo: {
        entry: vueSubAppEntry,
      },
    });
  });

  it('throw error when entry is not provided after beforeLoad', async () => {
    await expect(
      GarfishInstance.loadApp('vue-app', {
        domGetter: '#container',
      }),
    ).rejects.toThrow(
      'Please provide the entry parameters or registered in advance of the app.',
    );
  });

  it('load the same app will return the cache appInstance if the config cache is true', async () => {
    await GarfishInstance.run({
      domGetter: '#container',
      apps: [
        {
          name: 'vue-app',
          entry: vueSubAppEntry,
          cache: true,
        },
      ],
    });

    const app1 = await GarfishInstance.loadApp('vue-app');
    assert(app1, 'app1 should be loaded');
    await app1.mount();
    const app2 = await GarfishInstance.loadApp('vue-app');
    assert(app2, 'app2 should be loaded');

    expect(app1.mounted).toBe(true);
    expect(app2.mounted).toEqual(app1.mounted);
    expect(app1).toBe(app2);
  });

  it('load the same app will not return the cached appInstance if the config cache is false', async () => {
    GarfishInstance.run({
      domGetter: '#container',
      apps: [
        {
          name: 'vue-app',
          entry: vueSubAppEntry,
          cache: true,
        },
      ],
    });

    const app1 = await GarfishInstance.loadApp('vue-app');
    assert(app1, 'app2 should be loaded');
    await app1.mount();

    const app2 = await GarfishInstance.loadApp('vue-app', {
      entry: vue3SubAppEntry,
      cache: false,
    });
    assert(app2, 'app2 should be loaded');

    expect(app1.mounted).toBe(true);
    expect(app2.mounted).toBe(false);
    expect(app2.mounted).not.toEqual(app1.mounted);
    expect(app2.appInfo.entry).toEqual(vue3SubAppEntry);
  });

  it('load the same app will return the cached appInstance if the config cache is true and the app configs will not updates', async () => {
    GarfishInstance.run({
      domGetter: '#container',
      apps: [
        {
          name: 'vue-app',
          entry: vueSubAppEntry,
          cache: true,
        },
      ],
    });

    const app1 = await GarfishInstance.loadApp('vue-app');
    assert(app1, 'app2 should be loaded');
    await app1.mount();

    const app2 = await GarfishInstance.loadApp('vue-app', {
      entry: vue3SubAppEntry,
      cache: true,
    });
    assert(app2, 'app2 should be loaded');

    expect(app1.mounted).toBe(true);
    expect(app2.mounted).toEqual(app1.mounted);
    expect(app1).toBe(app2);
    expect(app1.appInfo.entry).toEqual(vueSubAppEntry);
  });

  it('destroy the app during rendering and then render again', async () => {
    GarfishInstance.run({
      domGetter: '#container',
      apps: [
        {
          name: 'async-provider',
          entry: asyncProviderApp,
          cache: true,
        },
      ],
    });

    const app = await GarfishInstance.loadApp('async-provider');
    assert(app, 'app2 should be loaded');
    expect(app.mounted).toBe(false);

    app.mount();
    app.unmount();

    await app.mount();
    expect(app.mounted).toBe(true);

    expect(document.body.contains(container)).toBe(true);
  });

  it('loadApp before registered, the `beforeLoad` hook will not receive the undefined app.', async () => {
    const mockBeforeLoad = jest.fn();

    GarfishInstance.run({
      domGetter: '#container',
      apps: [
        {
          name: 'react',
          entry: reactSubAppEntry,
        },
      ],
      beforeLoad: mockBeforeLoad,
    });

    const testName = 'react-unexisted';
    expect(GarfishInstance.appInfos[testName]).toBeUndefined;

    await GarfishInstance.loadApp(testName, {
      entry: reactSubAppEntry,
    });

    expect(mockBeforeLoad).toBeCalled();
    expect(mockBeforeLoad.mock.calls[0][0]).not.toBeUndefined;
    expect(mockBeforeLoad.mock.calls[0][0].name).toBe(testName);
    expect(mockBeforeLoad.mock.calls[0][0].entry).toBe(reactSubAppEntry);
  });

  it('multiple applications with the same entry are serially mounted, entryManager is not the same instance', async () => {
    const createApp = jest.fn(async (appName, dom, entry) => {
      GarfishInstance.registerApp({
        name: appName,
        entry,
      });

      const app = await GarfishInstance.loadApp(appName, { domGetter: dom });
      app && (await app.mount());
      return app;
    });

    const app1 = await createApp('app1', '#app1', vueSubAppEntry);
    const app2 = await createApp('app2', '#app2', vueSubAppEntry);
    const app3 = await createApp('app3', '#app2', vueSubAppEntry);

    assert(app1, 'app should be loaded');
    assert(app2, 'app should be loaded');
    assert(app3, 'app should be loaded');

    expect(app1).toHaveProperty('entryManager');
    expect(app2).toHaveProperty('entryManager');
    expect(app3).toHaveProperty('entryManager');

    expect(app1.entryManager).not.toBe(app2.entryManager);
    expect(app2.entryManager).not.toBe(app3.entryManager);
    expect(app1.entryManager).not.toBe(app3.entryManager);
  });

  it('multiple applications of the same entry are mounted at the same time, entryManager is not the same instance', async () => {
    const createApp = jest.fn(async (appName, dom, entry) => {
      GarfishInstance.registerApp({
        name: appName,
        entry,
      });

      const app = await GarfishInstance.loadApp(appName, { domGetter: dom });
      app && (await app.mount());
      return app;
    });

    const app1 = createApp('app1', '#app1', vueSubAppEntry);
    const app2 = createApp('app2', '#app2', vueSubAppEntry);
    const app3 = createApp('app3', '#app2', vueSubAppEntry);

    assert(app1, 'app should be loaded');
    assert(app2, 'app should be loaded');
    assert(app3, 'app should be loaded');

    await expect(app1).resolves.toHaveProperty('entryManager');
    await expect(app2).resolves.toHaveProperty('entryManager');
    await expect(app3).resolves.toHaveProperty('entryManager');

    expect(GarfishInstance.activeApps[0]).not.toBe(null);
    expect(GarfishInstance.activeApps[0]).toHaveProperty('entryManager');

    expect(GarfishInstance.activeApps[1]).not.toBe(null);
    expect(GarfishInstance.activeApps[1]).toHaveProperty('entryManager');

    expect(GarfishInstance.activeApps[2]).not.toBe(null);
    expect(GarfishInstance.activeApps[2]).toHaveProperty('entryManager');

    expect(GarfishInstance.activeApps[0].entryManager).not.toBe(
      GarfishInstance.activeApps[1].entryManager,
    );
    expect(GarfishInstance.activeApps[1].entryManager).not.toBe(
      GarfishInstance.activeApps[2].entryManager,
    );
    expect(GarfishInstance.activeApps[0].entryManager).not.toBe(
      GarfishInstance.activeApps[2].entryManager,
    );
  });

  it("loadApp before registered and `entry` don't be provided will throw Error", async () => {
    GarfishInstance.run({
      domGetter: '#container',
      apps: [
        {
          name: 'react',
          entry: reactSubAppEntry,
        },
      ],
    });
    const testName = 'react-unexisted';
    expect(GarfishInstance.appInfos[testName]).toBeUndefined;

    GarfishInstance.loadApp(testName).catch((e) =>
      expect(e.message).toMatch(
        'Please provide the entry parameters or registered in advance of the app.',
      ),
    );
  });
});
