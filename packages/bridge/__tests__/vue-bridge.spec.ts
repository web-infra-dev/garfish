// The logic of vue-bridge-test is referenced from single-spa typography
// Because the Garfish lifecycle does not agree with that of single-spa  part logical coupling in the framework
// https://github.com/single-spa/single-spa-vue/blob/main/src/single-spa-vue.test.js

import { vueBridge } from '../src/vueBridge';
const domElId = '#sub-app-container';
const cssSelector = '#app';

describe('vue-bridge', () => {
  let Vue,
    props,
    appInfo,
    $destroy,
    appContainer,
    container,
    $mount,
    $el,
    rootComponent,
    appOptions,
    loadRootComponent;

  beforeEach(() => {
    Vue = jest.fn();

    Vue.mockImplementation(function () {
      this.$destroy = $destroy;
      this.$mount = $mount;
      this.$el = $el;
    });

    $el = document.createElement('div');
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

    $destroy = jest.fn();
    $mount = jest.fn();
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
    expect(() => vueBridge({})).toThrow();
    expect(() => vueBridge({ Vue })).toThrow();
    expect(() => vueBridge({ Vue, rootComponent })).toThrow();
    expect(() => vueBridge({ Vue, loadRootComponent })).toThrow();
    expect(() =>
      vueBridge({ Vue, rootComponent, loadRootComponent }),
    ).toThrow();
    expect(() => vueBridge({ Vue, rootComponent, appOptions })).not.toThrow();
    expect(() =>
      vueBridge({ Vue, loadRootComponent, appOptions }),
    ).not.toThrow();
    expect(() =>
      vueBridge({ Vue, rootComponent, loadRootComponent, appOptions }),
    ).not.toThrow();
  });

  it('throws an error when appOptions.el is provided and the type is not string', async () => {
    expect(() =>
      vueBridge({
        Vue,
        loadRootComponent,
        appOptions: {
          el: {},
        },
      }),
    ).toThrow();
  });

  it('throws an error when appOptions.el is provided and appOptions.el.dom does not exist in the dom during mount', async () => {
    const provider = vueBridge({
      Vue,
      appOptions: {
        el: '#invalid_app',
      },
      rootComponent,
    });

    const lifeCycles = await provider(appInfo, props);
    expect(() => lifeCycles.render({ ...appInfo, props })).toThrow();
  });

  it('calls new Vue() during mount and mountedInstances.instance.$destroy() on unmount', async () => {
    const handleInstance = jest.fn();
    const provider = vueBridge({
      Vue,
      appOptions: {},
      handleInstance,
      rootComponent,
    });

    const lifeCycles = await provider(appInfo, props);

    expect(Vue).not.toHaveBeenCalled();
    expect(handleInstance).not.toHaveBeenCalled();
    expect($destroy).not.toHaveBeenCalled();

    lifeCycles.render({ ...appInfo, props });
    expect(Vue).toHaveBeenCalled();
    expect(handleInstance).toHaveBeenCalled();
    expect($destroy).not.toHaveBeenCalled();

    lifeCycles.destroy({ ...appInfo, props });
    expect($destroy).toHaveBeenCalled();
  });

  it('appOptions function will recieve the props provided at mount', async () => {
    const appOptions = jest.fn((props) => props);

    const provider = vueBridge({
      Vue,
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
      Vue,
      appOptions: {},
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
      Vue,
      appOptions: {},
      loadRootComponent,
      rootComponent: {},
    };

    opts.loadRootComponent.mockReturnValue(Promise.resolve({}));

    const provider = vueBridge(opts);

    const lifeCycles = await provider(appInfo, props);

    lifeCycles.render({ ...appInfo, props });
    expect(opts.loadRootComponent).toHaveBeenCalled();
    expect(Vue.mock.calls[0][0].render).toBeDefined();

    lifeCycles.destroy({ ...appInfo, props });
  });

  it('adds the garfish-vue-bridge props as data to the root component', async () => {
    props.someCustomThing = 'hi';

    const provider = vueBridge({
      Vue,
      appOptions: {},
      rootComponent: {},
    });

    const lifeCycles = await provider(appInfo, props);

    lifeCycles.render({ ...appInfo, props });
    expect(Vue).toHaveBeenCalled();
    expect(Vue.mock.calls[0][0].data()).toBeTruthy();
    expect(Vue.mock.calls[0][0].data().appName).toBe('test-app');
    expect(Vue.mock.calls[0][0].data().props.store.counter).toBe(100);

    lifeCycles.destroy({ ...appInfo, props });
  });

  it("mounts into the garfish-vue-bridge div if you don't provide an 'el' in appOptions", async () => {
    const provider = vueBridge({
      Vue,
      appOptions: {},
      rootComponent: {},
    });

    const lifeCycles = await provider(appInfo, props);

    lifeCycles.render({ ...appInfo, props });
    expect(Vue).toHaveBeenCalled();
    // expect(Vue.mock.calls[0][0].el).toBe(container);
    expect(container.contains($el)).toEqual(true);
    lifeCycles.destroy({ ...appInfo, props });
  });

  it('works with Vue 3 when you provide the full Vue module as an opt', async () => {
    Vue = {
      createApp: jest.fn(),
    };

    const appMock: any = jest.fn();
    appMock.mount = jest.fn();
    appMock.unmount = jest.fn();

    Vue.createApp.mockReturnValue(appMock);

    const props = { name: 'vue3-app', dom: container, basename: '/' };

    const handleInstance = jest.fn();

    const provider = vueBridge({
      Vue,
      appOptions: {},
      handleInstance,
      rootComponent: {},
    });
    const lifeCycles = await provider(appInfo, props);

    lifeCycles.render({ ...appInfo, props });

    expect(Vue.createApp).toHaveBeenCalled();
    // Vue 3 requires the data to be a function
    expect(typeof Vue.createApp.mock.calls[0][0].data).toBe('function');
    expect(handleInstance).toHaveBeenCalledWith(appMock, { ...appInfo, props });
    expect(appMock.mount).toHaveBeenCalled();

    lifeCycles.destroy({ ...appInfo, props });
    expect(appMock.unmount).toHaveBeenCalled();
  });

  it('works with Vue 3 when you provide the createApp function opt', async () => {
    const createApp = jest.fn();

    const appMock: any = jest.fn();
    appMock.mount = jest.fn();
    appMock.unmount = jest.fn();

    createApp.mockReturnValue(appMock);

    const appInfo = { name: 'vue3-app', dom: container, basename: '/' };

    const handleInstance = jest.fn();

    const provider = vueBridge({
      createApp,
      appOptions: {},
      handleInstance,
      rootComponent: {},
    });
    const lifeCycles = await provider(appInfo, props);

    lifeCycles.render({ ...appInfo, props });

    expect(createApp).toHaveBeenCalled();
    // Vue 3 requires the data to be a function
    expect(typeof createApp.mock.calls[0][0].data).toBe('function');
    expect(handleInstance).toHaveBeenCalledWith(appMock, { ...appInfo, props });
    expect(appMock.mount).toHaveBeenCalled();

    lifeCycles.destroy({ ...appInfo, props });
    expect(appMock.unmount).toHaveBeenCalled();
  });
});
