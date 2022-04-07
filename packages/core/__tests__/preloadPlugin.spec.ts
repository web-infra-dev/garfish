import { mockStaticServer } from '@garfish/utils';
import Garfish from '../src/index';
import { GarfishPreloadPlugin, storageKey } from '../src/plugins/preload';

describe('Core: preload plugin', () => {
  const vueSubAppEntry = './resources/vueApp.html';
  const reactSubAppEntry = './resources/reactApp.html';

  mockStaticServer(__dirname);

  it('disablePreloadApp is true close setRanking', async () => {
    const GarfishInstance = new Garfish({});
    GarfishInstance.run({
      disablePreloadApp: true,
      apps: [
        {
          name: 'vue-app',
          entry: vueSubAppEntry,
        },
      ],
    });
    await GarfishInstance.loadApp('vue-app');
    expect(localStorage.getItem(storageKey)).toBeNull();
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
    await GarfishInstance.loadApp('vue-app');
    await GarfishInstance.loadApp('vue-app');
    await GarfishInstance.loadApp('react-app');
    expect(localStorage.getItem(storageKey)).toMatchSnapshot();
  });
});
