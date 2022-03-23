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
  const vueSubAppEntry = './resources/vueApp.html';
  const reactSubAppEntry = './resources/reactApp.html';

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

    const appContainer = container.querySelector(`[id^=${appContainerId}]`);
    expect(appContainer.childNodes[0]).toMatchSnapshot();

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

    const appContainer = container.querySelector(`[id^=${appContainerId}]`);
    expect(appContainer.childNodes[0]).toMatchSnapshot();

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

    const appContainer = container.querySelector(`[id^=${appContainerId}]`);
    expect(appContainer.childNodes[0]).toMatchSnapshot();

    document.body.removeChild(container);
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
});
