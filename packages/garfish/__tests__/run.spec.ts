import Garfish from '@garfish/core';
import { GarfishRouter } from '@garfish/router';
import fetchMock from 'jest-fetch-mock';
import {
  reactAppHtml,
  reactAppRootNode,
  reactAppRootText,
  vueAppHtml,
  vueAppRootNode,
  vueAppRootText,
} from '@garfish/utils';
import {
  appContainerId,
  __MockBody__,
  __MockHead__,
  __MockHtml__,
} from '@garfish/utils';
global.fetch = fetchMock;

const vuePath = 'http://garfish-mock.com/vue-app';
const reactPath = 'http://garfish-mock.com/react-app';

function waitFor(delay = 50) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(false);
    }, delay);
  });
}

async function vueAppInDocument(container: Element) {
  await waitFor();
  const appContainer = container.querySelectorAll(`[id^=${appContainerId}]`);
  expect(appContainer).toHaveLength(1);
  expect(appContainer[0].querySelector(`#${vueAppRootNode}`).innerHTML).toBe(
    vueAppRootText,
  );
}

async function reactAppInDocument(container: Element) {
  await waitFor();
  const appContainer = container.querySelectorAll(`[id^=${appContainerId}]`);
  expect(appContainer).toHaveLength(1);
  expect(appContainer[0].querySelector(`#${reactAppRootNode}`).innerHTML).toBe(
    reactAppRootText,
  );
}

async function noRenderApp(container: Element) {
  await waitFor();
  const appContainer = container.querySelectorAll(`[id^=${appContainerId}]`);
  expect(appContainer).toHaveLength(0);
}

let GarfishInstance: Garfish;
const mockBeforeLoad = jest.fn();
const mockAfterLoad = jest.fn();
const mockBeforeMount = jest.fn();
const mockAfterMount = jest.fn();
const mockBeforeUnmount = jest.fn();
const mockAfterUnmount = jest.fn();

describe('Core: run methods', () => {
  beforeEach(() => {
    // https://www.npmjs.com/package/jest-fetch-mock
    fetchMock.mockIf(/^https?:\/\/garfish-mock.com.*$/, (req) => {
      if (req.url.endsWith('/vue-app')) {
        return Promise.resolve({
          body: vueAppHtml,
          headers: {
            'Content-Type': 'text/html',
          },
        });
      } else if (req.url.endsWith('/react-app')) {
        return Promise.resolve({
          body: reactAppHtml,
          headers: {
            'Content-Type': 'text/html',
          },
        });
      } else {
        return Promise.resolve({
          status: 404,
          body: 'Not Found',
        });
      }
    });

    fetchMock.doMock();
    GarfishInstance = new Garfish({
      plugins: [GarfishRouter()],
    });
    GarfishInstance.run({
      domGetter: '#container',
      basename: '/',
      apps: [
        {
          name: 'vue-app',
          activeWhen: '/vue-app',
          entry: vuePath,
        },
        {
          name: 'react-app',
          activeWhen: '/react-app',
          entry: reactPath,
        },
      ],
      beforeLoad: mockBeforeLoad,
      afterLoad: mockAfterLoad,
      beforeMount: mockBeforeMount,
      afterMount: mockAfterMount,
      beforeUnmount: mockBeforeUnmount,
      afterUnmount: mockAfterUnmount,
    });
  });

  it('auto render and destroy vue app', async () => {
    const container = document.createElement('div');
    container.setAttribute('id', 'container');
    document.body.appendChild(container);

    GarfishInstance.router.push({ path: '/vue-app' });
    await vueAppInDocument(container);
    expect(mockBeforeLoad.mock.calls[0][0].name).toBe('vue-app');
    expect(mockAfterLoad.mock.calls[0][0].name).toBe('vue-app');
    expect(mockBeforeMount.mock.calls[0][0].name).toBe('vue-app');
    expect(mockAfterMount.mock.calls[0][0].name).toBe('vue-app');

    GarfishInstance.router.push({ path: '/react-app' });
    await reactAppInDocument(container);
    expect(mockBeforeMount.mock.calls[0][0].name).toBe('vue-app');
    expect(mockAfterMount.mock.calls[0][0].name).toBe('vue-app');

    expect(mockBeforeLoad.mock.calls[1][0].name).toBe('react-app');
    expect(mockAfterLoad.mock.calls[1][0].name).toBe('react-app');
    expect(mockBeforeMount.mock.calls[1][0].name).toBe('react-app');
    expect(mockAfterMount.mock.calls[1][0].name).toBe('react-app');

    GarfishInstance.router.push({ path: '/' });
    await noRenderApp(container);
    expect(mockBeforeMount.mock.calls[1][0].name).toBe('react-app');
    expect(mockAfterMount.mock.calls[1][0].name).toBe('react-app');

    document.body.removeChild(container);
  });

  it('close router listening', async () => {
    const container = document.createElement('div');
    container.setAttribute('id', 'container');
    document.body.appendChild(container);
    await noRenderApp(container);

    GarfishInstance.router.push({ path: '/react-app' });
    await reactAppInDocument(container);

    GarfishInstance.router.setRouterConfig({ listening: false });
    GarfishInstance.router.push({ path: '/vue-app' });
    await noRenderApp(container);
    GarfishInstance.router.push({ path: '/react-app' });
    await noRenderApp(container);
    GarfishInstance.router.push({ path: '/' });
    await noRenderApp(container);

    GarfishInstance.router.setRouterConfig({ listening: true });
    GarfishInstance.router.push({ path: '/vue-app' });
    await vueAppInDocument(container);
  });
});
