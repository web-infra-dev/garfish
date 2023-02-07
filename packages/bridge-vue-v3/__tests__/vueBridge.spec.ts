// The logic of vue-bridge-test is referenced from single-spa typography
// Because the Garfish lifecycle does not agree with that of single-spa  part logical coupling in the framework
// https://github.com/single-spa/single-spa-vue/blob/main/src/single-spa-vue.test.js

import { vueBridge } from '../src/vueBridge';
const domElId = '#sub-app-container';
const cssSelector = '#app';

describe('vue-bridge', () => {
  let vue,
    props,
    appInfo,
    unmount,
    appContainer,
    container,
    mount,
    el,
    rootComponent,
    appOptions,
    loadRootComponent,
    appMock;

  beforeEach(() => {
    vue = {
      createApp: jest.fn(),
    };

    appMock = jest.fn();
    appMock.mount = mount;
    appMock.unmount = unmount;
    appMock.el = el;

    vue.createApp.mockReturnValue(appMock);

    el = document.createElement('div');
    container = document.createElement('div');
    container.setAttribute('id', domElId.replace('#', ''));
    document.body.appendChild(container);

    appContainer = document.createElement('div');
    container.setAttribute('id', cssSelector.replace('#', ''));
    container.appendChild(appContainer);

    appInfo = {
      appName: 'test-app',
      basename: '/demo',
      dom: container,
    };
    props = {
      store: { counter: 100 },
    };

    unmount = jest.fn();
    mount = jest.fn();
    rootComponent = {};
    loadRootComponent = jest.fn();
    appOptions = {};
  });

  afterEach(() => {
    document.querySelectorAll(cssSelector).forEach((node) => {
      node.remove();
    });
  });

  it('throws an error when required parameters are not provided', () => {
    expect(() => vueBridge({ rootComponent })).not.toThrow();
    expect(() => vueBridge({ loadRootComponent })).not.toThrow();
    expect(() => vueBridge({ rootComponent, loadRootComponent })).not.toThrow();
    expect(() => vueBridge({ rootComponent, appOptions })).not.toThrow();
    expect(() => vueBridge({ loadRootComponent, appOptions })).not.toThrow();
    expect(() =>
      vueBridge({ rootComponent, loadRootComponent, appOptions }),
    ).not.toThrow();
  });

  it('throws an error when appOptions.el is provided and the type is not string', async () => {
    expect(() =>
      vueBridge({
        loadRootComponent,
        appOptions: {
          el: {},
        } as any,
      }),
    ).toThrow();
  });

  it('throws an error when appOptions.el is provided and appOptions.el.dom does not exist in the dom during mount', async () => {
    const provider = vueBridge({
      appOptions: {
        el: '#invalid_app',
      } as any,
      rootComponent,
    });

    const lifeCycles = await provider(appInfo, props);
    expect(() => lifeCycles.render({ ...appInfo, props })).toThrow();
  });

  it('calls createApp during mount and mountedInstances.unmount() on unmount', async () => {
    const createAppSpy = jest.spyOn(vue, 'createApp');
    const mountSpy = jest.spyOn(appMock, 'mount');
    const unmountSpy = jest.spyOn(appMock, 'unmount');
    const handleInstance = jest.fn();
    const provider = vueBridge({
      createApp: vue.createApp,
      appOptions: {} as any,
      handleInstance,
      rootComponent,
    });

    const lifeCycles = await provider(appInfo, props);

    expect(createAppSpy).not.toHaveBeenCalled();
    expect(handleInstance).not.toHaveBeenCalled();
    expect(mountSpy).not.toHaveBeenCalled();
    expect(unmountSpy).not.toHaveBeenCalled();

    lifeCycles.render({ ...appInfo, props });

    expect(createAppSpy).toHaveBeenCalled();
    expect(mountSpy).toHaveBeenCalled();
    expect(handleInstance).toHaveBeenCalled();
    expect(unmountSpy).not.toHaveBeenCalled();

    lifeCycles.destroy({ ...appInfo, props });
    expect(unmountSpy).toHaveBeenCalled();
  });

  it('appOptions function will recieve the props provided at mount', async () => {
    const appOptions = jest.fn((props) => props);

    const provider = vueBridge({
      appOptions,
      rootComponent: {},
    });

    const lifeCycles = await provider(appInfo, props);
    lifeCycles.render({ ...appInfo, props });
    expect(appOptions.mock.calls[0][0].props).toEqual(props);
    expect(appOptions.mock.calls[0][0].appName).toBe('test-app');
    expect(appOptions.mock.calls[0][0].props.store.counter).toBe(100);
    lifeCycles.destroy({ ...appInfo, props });
  });

  it('handleInstance function will recieve the props provided at mount', async () => {
    const handleInstance = jest.fn((instance, props) => props);
    const provider = vueBridge({
      appOptions: {} as any,
      handleInstance,
      rootComponent: {},
    });

    const lifeCycles = await provider(appInfo, props);
    lifeCycles.render({ ...appInfo, props });
    expect(handleInstance.mock.calls[0][1]).toEqual({ ...appInfo, props });
    expect(handleInstance.mock.calls[0][1].props).toEqual(props);
    expect(handleInstance.mock.calls[0][1].appName).toBe('test-app');
    expect(handleInstance.mock.calls[0][1].props.store.counter).toBe(100);

    lifeCycles.destroy({ ...appInfo, props });
  });

  it('implements a render function for you if you provide loadRootComponent', async () => {
    const opts = {
      appOptions: {},
      loadRootComponent,
      rootComponent: {},
    };

    opts.loadRootComponent.mockReturnValue(Promise.resolve({}));
    const provider = vueBridge(opts as any);
    const lifeCycles = await provider(appInfo, props);

    lifeCycles.render({ ...appInfo, props });
    expect(opts.loadRootComponent).toHaveBeenCalled();

    lifeCycles.destroy({ ...appInfo, props });
  });

  it('adds the garfish-vue-bridge props as data to the root component', async () => {
    const provider = vueBridge({
      createApp: vue.createApp,
      appOptions: {} as any,
      rootComponent: {},
    });

    const lifeCycles = await provider(appInfo, props);

    lifeCycles.render({ ...appInfo, props });
    expect(vue.createApp).toHaveBeenCalled();
    expect(vue.createApp.mock.calls[0][0].data()).toBeTruthy();
    expect(vue.createApp.mock.calls[0][0].data().appName).toBe('test-app');
    expect(vue.createApp.mock.calls[0][0].data().props.store.counter).toBe(100);

    lifeCycles.destroy({ ...appInfo, props });
  });

  // eslint-disable-next-line quotes
  it("mounts into the garfish-vue-bridge div if you don't provide an 'el' in appOptions", async () => {
    const provider = vueBridge({
      createApp: vue.createApp,
      appOptions: {} as any,
      rootComponent: {},
    });

    const lifeCycles = await provider(appInfo, props);

    lifeCycles.render({ ...appInfo, props });
    expect(vue.createApp).toHaveBeenCalled();
    expect(vue.createApp.mock.calls[0][0].el).toBe(container);
    lifeCycles.destroy({ ...appInfo, props });
  });

  it('works with Vue 3 when you provide the full Vue module as an opt', async () => {
    const props = { name: 'vue3-app', dom: container, basename: '/' };
    const handleInstance = jest.fn();

    const provider = vueBridge({
      createApp: vue.createApp,
      appOptions: {} as any,
      handleInstance,
      rootComponent: {},
    });
    const lifeCycles = await provider(appInfo, props);

    lifeCycles.render({ ...appInfo, props });

    expect(vue.createApp).toHaveBeenCalled();
    // Vue 3 requires the data to be a function
    expect(typeof vue.createApp.mock.calls[0][0].data).toBe('function');
    expect(handleInstance).toHaveBeenCalledWith(appMock, { ...appInfo, props });
    expect(appMock.mount).toHaveBeenCalled();

    lifeCycles.destroy({ ...appInfo, props });
    expect(appMock.unmount).toHaveBeenCalled();
  });

  it('works with Vue 3 when you provide the createApp function opt', async () => {
    const appInfo = { name: 'vue3-app', dom: container, basename: '/' };
    const handleInstance = jest.fn();
    const provider = vueBridge({
      createApp: vue.createApp,
      appOptions: {} as any,
      handleInstance,
      rootComponent: {},
    });
    const lifeCycles = await provider(appInfo, props);

    lifeCycles.render({ ...appInfo, props });

    expect(vue.createApp).toHaveBeenCalled();
    // Vue 3 requires the data to be a function
    expect(typeof vue.createApp.mock.calls[0][0].data).toBe('function');
    expect(handleInstance).toHaveBeenCalledWith(appMock, { ...appInfo, props });
    expect(appMock.mount).toHaveBeenCalled();

    lifeCycles.destroy({ ...appInfo, props });
    expect(appMock.unmount).toHaveBeenCalled();
  });

  it('register sync provider', async () => {
    window.__GARFISH__ = true;
    window.__GARFISH_EXPORTS__ = {
      provider: null,
    } as any;

    vueBridge({
      createApp: vue.createApp,
      appOptions: {} as any,
      rootComponent: {},
    });

    expect(window.__GARFISH_EXPORTS__.provider).toBeTruthy();
  });

  it('register async provider', async () => {
    let asyncProvider: any;

    window.__GARFISH__ = true;
    window.__GARFISH_EXPORTS__ = {
      provider: null,
      registerProvider(fn: any) {
        asyncProvider = fn;
      },
    } as any;

    vueBridge({
      createApp: vue.createApp,
      appOptions: {} as any,
      rootComponent: {},
    });

    expect(asyncProvider).toBeTruthy();
    expect(window.__GARFISH_EXPORTS__.provider).toBe(null);
  });
});
