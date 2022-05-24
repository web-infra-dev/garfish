import {
  __MockBody__,
  __MockHead__,
  __MockHtml__,
  appContainerId,
} from '@garfish/utils';
import { mockStaticServer } from '@garfish/test-suite';

import Garfish from '../src/index';

describe('Core: load process', () => {
  let GarfishInstance: Garfish;
  let container;

  const vueSubAppEntry = './resources/vueApp.html';
  const reactSubAppEntry = './resources/reactApp.html';
  const vue3AppRenderNode = 'hello-world-vue3';
  const vue3SubAppEntry = './resources/vue3App.html';
  const asyncProviderApp = './resources/asyncProviderApp.html';

  mockStaticServer(__dirname);

  beforeEach(() => {
    container = document.createElement('div');
    container.setAttribute('id', 'container');
    document.body.appendChild(container);
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

    await app.mount();

    const appContainer = container.querySelector(`[id^=${appContainerId}]`);
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

    await expect(app.mount.bind(app)).rejects.toThrowError(/Invalid domGetter/);
  });

  it('domGetter is function', async () => {
    const app = await GarfishInstance.loadApp('vue-app', {
      entry: vueSubAppEntry,
      domGetter: () => document.querySelector('#container'),
    });

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
    const mockBeforeLoad = jest.fn(() => {
      GarfishInstance.appInfos['vue-app'] = {
        name: 'vue-app',
        entry: vue3SubAppEntry,
      };
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
      }),
    ).resolves.toMatchObject({
      appInfo: {
        entry: vue3SubAppEntry,
      },
    });

    const app = await GarfishInstance.loadApp('vue-app', {
      entry: vue3SubAppEntry,
      domGetter: '#container',
    });

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

  it('load the same app while return the cache instance if cache is true', async () => {
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
    await app1.mount();
    const app2 = await GarfishInstance.loadApp('vue-app');

    expect(app1.mounted).toBe(true);
    expect(app2.mounted).toEqual(app1.mounted);
  });

  it('load the same app while return the cache instance if cache is set true', async () => {
    await GarfishInstance.run({
      domGetter: '#container',
      apps: [
        {
          name: 'vue-app',
          entry: vueSubAppEntry,
          cache: false,
        },
      ],
    });

    const app1 = await GarfishInstance.loadApp('vue-app');
    await app1.mount();
    const app2 = await GarfishInstance.loadApp('vue-app');

    expect(app1.mounted).toBe(true);
    expect(app2.mounted).not.toEqual(app1.mounted);
  });

  it('load the same app while return the cache instance if cache is set false', async () => {
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
    await app1.mount();

    const app2 = await GarfishInstance.loadApp('vue-app', {
      entry: vue3SubAppEntry,
      cache: false,
    });

    expect(app1.mounted).toBe(true);
    expect(app2.mounted).toBe(false);
    expect(app2.appInfo.entry).toEqual(vue3SubAppEntry);
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
    expect(app.mounted).toBe(false);

    app.mount();
    app.unmount();

    await app.mount();
    expect(app.mounted).toBe(true);

    expect(document.body.contains(container)).toBe(true);
  });
});
