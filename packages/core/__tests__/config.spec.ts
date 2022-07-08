import { generateAppOptions } from '../src/config';
import Garfish from '../src';
import assert from 'assert';
import { mockStaticServer } from '@garfish/test-suite';

let GarfishInstance: Garfish;

const vueSubAppEntry = './resources/vueApp.html';
const reactSubAppEntry = './resources/reactApp.html';

describe('config', () => {
  mockStaticServer({
    baseDir: __dirname,
  });

  beforeEach(() => {
    GarfishInstance = new Garfish({});
  });

  it('global default config', () => {
    expect(GarfishInstance.options).toMatchObject({
      autoRefreshApp: true,
      disableStatistics: false,
      disablePreloadApp: false,
      basename: '/',
      sandbox: {
        snapshot: false,
        fixBaseUrl: false,
        disableWith: false,
        strictIsolation: false,
      },
    });
  });

  it('set global config', () => {
    const globalConfig: typeof GarfishInstance.options = {
      apps: [],
      autoRefreshApp: false,
      disableStatistics: true,
      disablePreloadApp: true,
      plugins: [],
      domGetter: '#root',
      basename: '/hello',
      sandbox: false,
      props: {
        a: new Proxy({}, {}),
      },
    };

    GarfishInstance.setOptions(globalConfig);
    expect(GarfishInstance.options).toMatchObject({
      autoRefreshApp: false,
      disableStatistics: true,
      disablePreloadApp: true,
      sandbox: false,
      basename: globalConfig.basename,
      domGetter: globalConfig.domGetter,
    });

    assert(GarfishInstance.options.props);
    assert(globalConfig.props);
    expect(GarfishInstance.options.props.a).toBe(globalConfig.props.a);
  });

  it('run set config', () => {
    const globalConfig: typeof GarfishInstance.options = {
      autoRefreshApp: false,
      disableStatistics: true,
      disablePreloadApp: true,
      domGetter: '#run',
      basename: '/set',
      apps: [{ name: 'app1', entry: vueSubAppEntry }],
      props: {
        b: new Proxy({}, {}),
      },
    };

    const setConfig: typeof GarfishInstance.options = {
      disablePreloadApp: false,
      apps: [{ name: 'app2', entry: reactSubAppEntry }],
      sandbox: {
        snapshot: true,
      },
      props: {
        s: new Proxy({}, {}),
      },
    };

    GarfishInstance.setOptions(setConfig);
    GarfishInstance.run(globalConfig);
    assert(globalConfig.apps);
    assert(setConfig.apps);
    expect(GarfishInstance.options).toMatchObject({
      autoRefreshApp: false,
      disableStatistics: true,
      disablePreloadApp: true,
      sandbox: setConfig.sandbox,
      basename: globalConfig.basename,
      domGetter: globalConfig.domGetter,
    });
    expect(GarfishInstance.options.apps).toEqual(
      expect.arrayContaining([...globalConfig.apps, ...setConfig.apps]),
    );
    assert(GarfishInstance.options.props);
    assert(globalConfig.props);
    assert(setConfig.props);
    expect(GarfishInstance.options.props.b).toBe(globalConfig.props.b);
  });

  it('loadApp with globalOptions', async () => {
    GarfishInstance.run({
      apps: [{ name: 'app1', entry: reactSubAppEntry }],
      basename: '/hello',
      props: {
        a: new Proxy({}, {}),
      },
      customLoader: () => {},
    });
    const app = await GarfishInstance.loadApp('app1');
    assert(app);
    assert(GarfishInstance.options.props);
    expect(app.appInfo).toMatchObject({
      name: GarfishInstance.appInfos.app1.name,
      entry: GarfishInstance.appInfos.app1.entry,
      basename: GarfishInstance.options.basename,
      props: {
        a: GarfishInstance.options.props.a,
      },
      customLoader: GarfishInstance.options.customLoader,
    });
  });

  it('loadApp with localConfig', async () => {
    const appInfo: Parameters<typeof GarfishInstance.loadApp>[1] = {
      entry: reactSubAppEntry,
      domGetter: '#app1',
      basename: '/app1',
      props: {
        hello: new Proxy({ hello: 'msg' }, {}),
      },
      customLoader: () => {},
    };
    const app = await GarfishInstance.loadApp('app1', appInfo);
    assert(app);
    assert(GarfishInstance.options.props);
    expect(app.appInfo).toMatchObject({
      ...appInfo,
    });
  });

  it('loadApp with localConfig and globalOptions', async () => {
    GarfishInstance.run({
      apps: [{ name: 'app1', entry: vueSubAppEntry }],
      basename: '/hello',
      domGetter: '#root',
      props: {
        a: new Proxy({}, {}),
      },
      customLoader: () => {},
    });
    const appInfo: Parameters<typeof GarfishInstance.loadApp>[1] = {
      entry: reactSubAppEntry,
      domGetter: '#app1',
      basename: '/app1',
      props: {
        hello: new Proxy({ hello: 'msg' }, {}),
      },
      customLoader: () => {},
    };
    const app = await GarfishInstance.loadApp('app1', appInfo);
    assert(app);
    assert(appInfo.props);
    assert(GarfishInstance.options.props);
    assert(app.appInfo.props);
    expect(app.appInfo).toMatchObject({
      ...appInfo,
      props: {
        ...appInfo.props,
        ...GarfishInstance.options.props,
      },
    });
    expect(app.appInfo.props.a).toBe(GarfishInstance.options.props.a);
    expect(app.appInfo.props.hello).toBe(appInfo.props.hello);
  });

  it('loadApp appInfo ignore unless config', async () => {
    const globalConfig: typeof GarfishInstance.options = {};
    const appInfo: Parameters<typeof GarfishInstance.registerApp>[0] = {
      name: 'app',
      basename: '/demo',
      activeWhen: '/hello',
      props: {
        a: new Proxy({}, {}),
        b: new Proxy({}, {}),
      },
      entry: reactSubAppEntry,
    };
    const localConfig: Parameters<typeof generateAppOptions>[2] = {
      domGetter: '#root1',
      basename: '/demo1',
      props: {
        a: new Proxy({}, {}),
      },
    };

    GarfishInstance.registerApp(appInfo);
    GarfishInstance.setOptions(globalConfig);
    const newAppInfo = generateAppOptions('app', GarfishInstance, localConfig);

    assert(newAppInfo.props);
    assert(appInfo.props);
    assert(localConfig);
    assert(localConfig.props);
    expect(newAppInfo.props.a).toBe(localConfig.props.a);
    expect(newAppInfo.props.b).toBe(appInfo.props.b);

    expect(newAppInfo).toMatchObject({
      name: appInfo.name,
      domGetter: localConfig.domGetter,
      basename: localConfig.basename,
      activeWhen: appInfo.activeWhen,
      props: {
        a: appInfo.props.a,
        b: appInfo.props.b,
      },
      entry: appInfo.entry,
    });
  });
});
