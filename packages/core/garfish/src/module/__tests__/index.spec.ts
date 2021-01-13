import { Garfish } from '../../garfish';

const jsAppVueA =
  'https://sf1-scmcdn-tos.pstatp.com/goofy/gar/example/vue2/index.js';
const htmlAppReact =
  'https://sf1-scmcdn-tos.pstatp.com/goofy/gar/example/vue3/index.html';

const create = () =>
  new Garfish({
    domGetter: () => document.createElement('div'),
  } as any);

describe('register app', () => {
  let context: Garfish;

  beforeEach(() => {
    context = create();
  });

  it('test setModulePath flat params', () => {
    context.registerApp([
      {
        name: 'index',
        entry: 'sourceLink1',
        activeWhen: '/index',
      },
      {
        name: 'detail',
        entry: 'sourceLink2',
        activeWhen: '/detail',
      },
    ]);

    expect(context.appInfos).toEqual(
      expect.objectContaining({
        index: {
          name: 'index',
          entry: 'sourceLink1',
          activeWhen: '/index',
        },
        detail: {
          name: 'detail',
          entry: 'sourceLink2',
          activeWhen: '/detail',
        },
      }),
    );
  });

  it('test setExternals', () => {
    context.setExternal('test', { a: 1 });
    expect(context.externals.test.a).toEqual(1);
  });
});

describe('test loadApp', () => {
  const testLoadApp = (entry, next) => {
    const context = create();

    // 该文件为./testScript/testExample.js文件
    context.registerApp([
      {
        name: 'index',
        activeWhen: '/index',
        entry: entry,
      },
    ]);

    document.body.innerHTML = '<div id="root"></div>';

    try {
      context.loadApp('index').then(async (app) => {
        expect(typeof app.mount).toBe('function');
        expect(typeof app.unmount).toBe('function');
        expect(typeof app.compile).toBe('function');
        await app.compile();
        expect(typeof app.getProvider).toBe('function');
        next();
      });
    } catch (err) {
      throw err;
    }
  };

  it('load js entry app', (next) => {
    testLoadApp(jsAppVueA, next);
  });

  it('load html entry app', (next) => {
    testLoadApp(htmlAppReact, next);
  });
});
