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
  let container, app;

  const vueSubAppEntry = './resources/vueApp.html';

  mockStaticServer({
    baseDir: __dirname,
  });

  beforeEach(() => {
    container = document.createElement('div');
    container.setAttribute('id', 'container');
    document.body.appendChild(container);

    app = document.createElement('div');
    app.setAttribute('id', 'app1');
    container.appendChild(app);

    GarfishInstance = new Garfish({});
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('preExecScript cache', async () => {
    const app = await GarfishInstance.loadApp('vue-app', {
      entry: vueSubAppEntry,
      domGetter: '#container',
    });

    assert(app, 'app should be loaded');

    await app.preExecScript();
    expect(app.execScriptCache.get('defer')).toBe(true);

    await app.mount();
    expect(GarfishInstance.activeApps[0]).toBe(app);

    app.hide();
    expect(GarfishInstance.activeApps[0]).toBeUndefined();

    await app.show();
    expect(GarfishInstance.activeApps[0]).toBe(app);

    await app.unmount();
    expect(GarfishInstance.activeApps[0]).toBeUndefined();
    // clear
    expect(app.execScriptCache.size).toBe(0);
  });
});
