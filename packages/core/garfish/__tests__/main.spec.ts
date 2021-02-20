import { Garfish } from '../src/garfish';
import { createGarfish } from './testUtils';

const basePath = (p) =>
  `https://sf1-scmcdn-tos.pstatp.com/goofy/gar/example/${p}`;

describe('Register app', () => {
  let garfish: Garfish;

  beforeEach(() => {
    garfish = createGarfish({
      domGetter: () => document.createElement('div'),
    });
  });

  it('Test setModulePath flat params', () => {
    garfish.registerApp([
      {
        name: 'index',
        entry: 'sourcelink1',
        activeWhen: '/index',
      },
      {
        name: 'detail',
        entry: 'sourcelink2',
        activeWhen: '/detail',
      },
    ]);
    expect(garfish.appInfos).toEqual(
      expect.objectContaining({
        index: {
          name: 'index',
          entry: 'sourcelink1',
          activeWhen: '/index',
        },
        detail: {
          name: 'detail',
          entry: 'sourcelink2',
          activeWhen: '/detail',
        },
      }),
    );
  });

  it('Test setExternals', () => {
    garfish.setExternal('test', { a: 1 });
    expect(garfish.externals.test.a).toEqual(1);
  });
});

describe('Test loadApp', () => {
  let garfish;
  beforeEach(() => {
    garfish = createGarfish({
      domGetter: () => document.createElement('div'),
    });
  });

  it('Load js entry app', (done) => {
    // 该文件为./testScript/testExample.js文件
    garfish.registerApp([
      {
        name: 'index',
        activeWhen: '/index',
        entry: basePath('vue2/index.js'),
      },
    ]);
    document.body.innerHTML = '<div id="root"></div>';
    try {
      garfish.loadApp('index').then(async (app) => {
        expect(typeof app.mount).toBe('function');
        expect(typeof app.unmount).toBe('function');
        expect(typeof app.compile).toBe('function');
        await app.compile();
        expect(typeof app.getProvider).toBe('function');
        done();
      });
    } catch (err) {
      throw err;
    }
  });

  it('Load html entry app', (done) => {
    // 该文件为./testScript/testExample.js文件
    garfish.registerApp([
      {
        name: 'index',
        activeWhen: '/index',
        entry: basePath('vue3/index.html'),
      },
    ]);
    document.body.innerHTML = '<div id="root"></div>';
    try {
      garfish.loadApp('index').then(async (app) => {
        expect(typeof app.mount).toBe('function');
        expect(typeof app.unmount).toBe('function');
        expect(typeof app.compile).toBe('function');
        await app.compile();
        expect(typeof app.getProvider).toBe('function');
        done();
      });
    } catch (err) {
      throw err;
    }
  });
});
