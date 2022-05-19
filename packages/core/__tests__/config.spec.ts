import { generateAppOptions } from '../src/config';
import Garfish from '../src';

let GarfishInstance: Garfish;

describe('config', () => {
  beforeEach(() => {
    GarfishInstance = new Garfish({});
  });

  it('ignore global config', () => {
    const globalConfig: typeof GarfishInstance.options = {
      appID: '',
      apps: [],
      autoRefreshApp: true,
      disableStatistics: false,
      disablePreloadApp: false,
      plugins: [],
      domGetter: '#root',
      basename: '/',
      props: {
        a: new Proxy({}, {}),
      },
    };
    const appInfo: Parameters<typeof GarfishInstance.registerApp>[0] = {
      name: 'app',
      basename: '/demo',
      activeWhen: '/hello',
      props: {
        b: new Proxy({ hello: 'world' }, {}),
      },
      entry: 'http://localhost:2333',
    };

    GarfishInstance.registerApp(appInfo);
    GarfishInstance.setOptions(globalConfig);
    const newAppInfo = generateAppOptions('app', GarfishInstance);

    expect(Object.keys(newAppInfo)).toEqual(
      expect.arrayContaining([
        'name',
        'activeWhen',
        'props',
        'basename',
        'domGetter',
      ]),
    );
    expect(newAppInfo.props.a).toBe(globalConfig.props.a);
    expect(newAppInfo.props.b).toBe(appInfo.props.b);

    expect(newAppInfo).toMatchObject({
      name: appInfo.name,
      domGetter: globalConfig.domGetter,
      basename: appInfo.basename,
      activeWhen: appInfo.activeWhen,
      props: {
        a: globalConfig.props.a,
        b: appInfo.props.b,
      },
      entry: appInfo.entry,
    });
  });

  it('ignore appInfo config', () => {
    const globalConfig: typeof GarfishInstance.options = {};
    const appInfo: Parameters<typeof GarfishInstance.registerApp>[0] = {
      name: 'app',
      basename: '/demo',
      activeWhen: '/hello',
      props: {
        a: new Proxy({}, {}),
        b: new Proxy({}, {}),
      },
      entry: 'http://localhost:2333',
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
