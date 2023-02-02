import { mockStaticServer } from '@garfish/test-suite';
import Garfish from '../src/index';

describe('Core: preload plugin', () => {
  const vueSubAppEntry = './resources/vueApp.html';
  const reactSubAppEntry = './resources/reactApp.html';

  mockStaticServer({
    baseDir: __dirname,
  });

  it('disablePreloadApp is false use setRanking', async () => {
    const GarfishInstance = new Garfish({});
    GarfishInstance.run({
      disablePreloadApp: false,
      apps: [
        {
          name: 'vue-app',
          entry: vueSubAppEntry,
        },
        {
          name: 'react-app',
          entry: reactSubAppEntry,
        },
      ],
    });
    const app = await GarfishInstance.loadApp('vue-app');
    await app?.mount();
    app?.addSourceList({
      tagName: 'fetch',
      url: 'http://localhost/resources/scripts/fetch.js',
    });
    app?.addSourceList({
      tagName: 'fetch',
      url: 'http://localhost/resources/scripts/no-entry.js',
    });
    app?.addSourceList({
      tagName: 'fetch',
      url: new URL('http://localhost/resources/reactApp.html'),
    });
    app?.addSourceList({
      tagName: 'fetch',
      url: new Request('http://localhost/resources/vue3App.html'),
    });
    app?.addSourceList({
      tagName: 'style',
      url: 'http://localhost/resources/scripts/style.js',
    });
    app?.addSourceList([
      { tagName: 'fetch', url: 'http://localhost/resources/scripts/fetch.js' },
      { tagName: 'script', url: 'http://localhost/resources/index.js' },
    ]);
    app?.addSourceList({
      tagName: 'fetch',
      url: '/resources/scripts/render.js',
    });
    app?.addSourceList({
      tagName: 'script',
      url: '/resources/scripts/render.js',
    });

    expect(app!.sourceList.length).toBe(7);
    expect(app!.sourceList[0]).toMatchObject({
      tagName: 'script',
      url: 'http://localhost/resources/scripts/no-entry.js',
    });
    expect(app!.sourceList[1]).toMatchObject({
      tagName: 'fetch',
      url: 'http://localhost/resources/scripts/fetch.js',
    });
    expect(app!.sourceList[2]).toMatchObject({
      tagName: 'fetch',
      url: new URL('http://localhost/resources/reactApp.html'),
    });
    expect(app!.sourceList[3]).toMatchObject({
      tagName: 'fetch',
      url: new Request('http://localhost/resources/vue3App.html'),
    });
    expect(app!.sourceList[4]).toMatchObject({
      tagName: 'style',
      url: 'http://localhost/resources/scripts/style.js',
    });
    expect(app!.sourceList[5]).toMatchObject({
      tagName: 'script',
      url: 'http://localhost/resources/index.js',
    });
    expect(app!.sourceList[6]).toMatchObject({
      tagName: 'fetch',
      url: '/resources/scripts/render.js',
    });
  });

  it('set disableSourceListCollect true will not collect sourceList', async () => {
    const GarfishInstance = new Garfish({});
    GarfishInstance.run({
      disablePreloadApp: false,
      apps: [
        {
          name: 'vue-app',
          entry: vueSubAppEntry,
          cache: true,
          disableSourceListCollect: true,
        },
      ],
    });
    const app = await GarfishInstance.loadApp('vue-app');
    await app?.mount();

    app?.addSourceList({
      tagName: 'fetch',
      url: 'http://localhost/resources/scripts/fetch.js',
    });
    expect(app!.sourceList.length).toBe(0);

    await GarfishInstance.loadApp('vue-app', {
      disableSourceListCollect: false,
    });

    app?.addSourceList({
      tagName: 'fetch',
      url: 'http://localhost/resources/scripts/fetch.js',
    });

    expect(app!.appInfo.disableSourceListCollect).toBe(true);
    expect(app!.sourceList.length).toBe(0);

    const app2 = await GarfishInstance.loadApp('vue-app', {
      cache: false,
      disableSourceListCollect: false,
    });

    expect(app2).not.toBe(app);
    expect(app!.appInfo.disableSourceListCollect).toBe(true);
    expect(app2!.appInfo.disableSourceListCollect).toBe(false);
    expect(app2!.sourceList.length).toBe(1);

    expect(app2!.sourceList[0]).toMatchObject({
      tagName: 'script',
      url: 'http://localhost/resources/scripts/no-entry.js',
    });

    app2?.addSourceList({
      tagName: 'fetch',
      url: 'http://localhost/resources/scripts/fetch.js',
    });

    expect(app2!.sourceList.length).toBe(2);
    expect(app2!.sourceList[1]).toMatchObject({
      tagName: 'fetch',
      url: 'http://localhost/resources/scripts/fetch.js',
    });
  });

});
