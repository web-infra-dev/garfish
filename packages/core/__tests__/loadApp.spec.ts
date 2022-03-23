import {
  __MockBody__,
  __MockHead__,
  __MockHtml__,
  appContainerId,
  mockStaticServer,
} from '@garfish/utils';
import Garfish from '../src/index';

describe('Core: load process', () => {
  let GarfishInstance;
  const vueAppRenderNode = 'hello-world';
  const vueSubAppEntry = './vueApp.html';

  mockStaticServer(__dirname);

  beforeEach(() => {
    GarfishInstance = new Garfish({});
  });

  it('domGetter cssSelector', async () => {
    const container = document.createElement('div');
    container.setAttribute('id', 'container');
    document.body.appendChild(container);
    const app = await GarfishInstance.loadApp('vue-app', {
      entry: vueSubAppEntry,
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
      appContainer[0].querySelectorAll(`[id=${vueAppRenderNode}]`),
    ).toHaveLength(1);
    app.unmount();
    expect(container.querySelectorAll(`[id^=${appContainerId}]`)).toHaveLength(
      0,
    );
    document.body.removeChild(container);
  });

  it('domGetter cssSelector delay 2000ms can work normally', async () => {
    const container = document.createElement('div');
    setTimeout(() => {
      container.setAttribute('id', 'container');
      document.body.appendChild(container);
    }, 1000);

    const app = await GarfishInstance.loadApp('vue-app', {
      entry: vueSubAppEntry,
      domGetter: '#container',
    });

    await app.mount();

    const appContainer = container.querySelectorAll(`[id^=${appContainerId}]`);
    expect(appContainer).toHaveLength(1);
    app.unmount();
    document.body.removeChild(container);
  });

  it('domGetter cssSelector delay 3500ms throw error', async () => {
    const container = document.createElement('div');
    setTimeout(() => {
      container.setAttribute('id', 'container');
      document.body.appendChild(container);
    }, 3500);

    const app = await GarfishInstance.loadApp('vue-app', {
      entry: vueSubAppEntry,
      domGetter: '#container',
    });

    await expect(app.mount.bind(app)).rejects.toThrowError(/Invalid domGetter/);
  });

  it('domGetter is function', async () => {
    const container = document.createElement('div');
    container.setAttribute('id', 'container');
    document.body.appendChild(container);
    const app = await GarfishInstance.loadApp('vue-app', {
      entry: vueSubAppEntry,
      domGetter: () => document.querySelector('#container'),
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
      appContainer[0].querySelectorAll(`[id=${vueAppRenderNode}]`),
    ).toHaveLength(1);
    app.unmount();
    expect(container.querySelectorAll(`[id^=${appContainerId}]`)).toHaveLength(
      0,
    );
    document.body.removeChild(container);
  });

  it('not throws an error when entry option is provided', async () => {
    await expect(
      GarfishInstance.loadApp('vue-app', {
        domGetter: '#container',
        entry: vueSubAppEntry,
      }),
    ).resolves.toMatchObject({
      appInfo: {
        entry: vueSubAppEntry,
      },
    });
  });

  it('throws an error when entry option is not provided', async () => {
    let isError = false;
    try {
      await GarfishInstance.loadApp('vue-app', {
        domGetter: '#container',
      });
    } catch (error) {
      isError = true;
    }
    expect(isError).toBe(true);
  });

  it('check the error message when entry is not provided after beforeLoad', async () => {
    await expect(
      GarfishInstance.loadApp('vue-app', {
        domGetter: '#container',
      }),
    ).rejects.toThrow(
      'Please provide the entry parameters or registered in advance of the app.',
    );
  });

  it('not throws an error when entry is provided after beforeLoad', async () => {
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
});
