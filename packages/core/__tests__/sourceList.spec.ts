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
    let app = await GarfishInstance.loadApp('vue-app');
    await app?.mount();
    app?.addSourceList({tagName: 'fetch', url: "http://localhost/resources/scripts/fetch.js"});
    app?.addSourceList({tagName: 'fetch', url: "http://localhost/resources/scripts/no-entry.js"});
    app?.addSourceList({tagName: 'style', url: "http://localhost/resources/scripts/style.js"});
    app?.addSourceList([
      {tagName: 'fetch', url: "http://localhost/resources/scripts/fetch.js"},
      {tagName: 'script', url: "http://localhost/resources/index.js"},
    ]);

    expect(app!.sourceList.length).toBe(4);
    expect(app!.sourceList[0]).toMatchObject({
      tagName: 'script',
      url: 'http://localhost/resources/scripts/no-entry.js'
    });
    expect(app!.sourceList[1]).toMatchObject({
      tagName: 'fetch',
      url: 'http://localhost/resources/scripts/fetch.js'
    });
    expect(app!.sourceList[2]).toMatchObject({
      tagName: 'style',
      url: 'http://localhost/resources/scripts/style.js'
    });
    expect(app!.sourceList[3]).toMatchObject({
      tagName: 'script',
      url: 'http://localhost/resources/index.js'
    });
  });
});
