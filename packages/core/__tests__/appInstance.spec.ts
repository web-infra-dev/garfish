import {
  __MockBody__,
  __MockHead__,
  __MockHtml__,
  appContainerId,
} from '@garfish/utils';
import { mockStaticServer } from '@garfish/test-suite';
import Garfish from '../src/index';
import assert from 'assert';

describe('Core: appInstance', () => {
  let GarfishInstance: Garfish;
  let container;

  const vueSubAppEntry = './resources/vueApp.html';
  const reactSubAppEntry = './resources/reactApp.html';
  const vue3AppRenderNode = 'hello-world-vue3';
  const vue3SubAppEntry = './resources/vue3App.html';
  const asyncProviderApp = './resources/asyncProviderApp.html';
  const asyncProviderRegistrationApp =
    './resources/asyncProviderRegistration.html';

  mockStaticServer({
    baseDir: __dirname,
  });

  beforeEach(() => {
    container = document.createElement('div');
    container.setAttribute('id', 'container');
    document.body.appendChild(container);
    GarfishInstance = new Garfish({});
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('mount activeApps', async () => {
    const app = await GarfishInstance.loadApp('vue-app', {
      entry: vueSubAppEntry,
      domGetter: '#container',
    });

    assert(app, 'app should be defined');
    await app.mount();
    expect(GarfishInstance.activeApps[0]).toBe(app);

    app.hide();
    expect(GarfishInstance.activeApps[0]).toBeUndefined();

    await app.show();
    expect(GarfishInstance.activeApps[0]).toBe(app);

    await app.unmount();
    expect(GarfishInstance.activeApps[0]).toBeUndefined();
  });

  it('mount asyncProviderRegistrationApp', async () => {
    const app = await GarfishInstance.loadApp('async-provider-registration', {
      entry: asyncProviderRegistrationApp,
      domGetter: '#container',
    });

    assert(app, 'app should be defined');
    await app.mount();
    expect(GarfishInstance.activeApps[0]).toBe(app);

    app.hide();
    expect(GarfishInstance.activeApps[0]).toBeUndefined();

    await app.show();
    expect(GarfishInstance.activeApps[0]).toBe(app);

    await app.unmount();
    expect(GarfishInstance.activeApps[0]).toBeUndefined();
  });
});
