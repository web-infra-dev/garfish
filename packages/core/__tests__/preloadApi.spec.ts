import { mockStaticServer } from '@garfish/test-suite';
import assert from 'assert';
import Garfish from '../src/index';

const sleep = (time = 200) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(false);
    }, time);
  });
};

describe('Core: preload plugin', () => {
  let GarfishInstance: Garfish;
  let container;
  const preloadSubAppEntry = './resources/preloadApp.html';

  mockStaticServer({
    baseDir: __dirname,
    customerHeaders: {
      [preloadSubAppEntry]: {
        timeConsuming: 200,
      },
    }
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

  it('preload caches file success', async () => {
    const GarfishInstance = new Garfish({});
    let app: Awaited<ReturnType<typeof GarfishInstance.loadApp>> = null;
    GarfishInstance.run({
      disablePreloadApp: false,
      domGetter: '#container',
      apps: [
        {
          name: 'preload-app',
          entry: preloadSubAppEntry,
        },
      ],
    });
    GarfishInstance.preloadApp('preload-app');
    await sleep(450);
    GarfishInstance.loadApp('preload-app').then((res) => {
      app = res;
    });
    await sleep(50);
    assert(app, 'app should be loaded');
    expect(app).toBeDefined();
    await (app as any).mount();
    expect(document.querySelector('#container #app')?.innerHTML).toBe(
      '<div>Hello World preload app</div>',
    );
  });
});
