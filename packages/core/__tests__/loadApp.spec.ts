import Garfish from '../src/index';
import fetchMock from 'jest-fetch-mock';
import { vueAppHtml, vueAppRenderNode } from './resource/vue-app';
import {
  appContainerId,
  __MockBody__,
  __MockHead__,
  __MockHtml__,
} from '@garfish/utils';
global.fetch = fetchMock;

// https://www.npmjs.com/package/jest-fetch-mock
function mockResource(code: string, contentType = 'application/javascript') {
  const url = `http://garfish-mock.com/${performance.now()}`;
  fetchMock.mockIf(url, () => {
    return Promise.resolve({
      body: code,
      headers: {
        'Content-Type': contentType,
      },
    });
  });
  return url;
}

const GarfishInstance = new Garfish({});

describe('Core: load process', () => {
  let vueSubAppEntry: string;

  beforeEach(() => {
    vueSubAppEntry = mockResource(vueAppHtml, 'text/html');
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
});
