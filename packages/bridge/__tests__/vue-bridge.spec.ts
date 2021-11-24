// The logic of vue-bridge-test is referenced from single-spa typography
// Because the Garfish lifecycle does not agree with that of single-spa  part logical coupling in the framework
// https://github.com/single-spa/single-spa-vue/blob/main/src/single-spa-vue.test.js

import { vueBridge } from '../src/vueBridge';
const domElId = '#sub-app-container';
const cssSelector = '#app';

describe('vue-bridge', () => {
  let Vue, props, $destroy, appContainer, container;

  beforeEach(() => {
    Vue = jest.fn();

    Vue.mockImplementation(function () {
      this.$destroy = $destroy;
      this.$el = { innerHTML: '' };
    });

    container = document.createElement('div');
    container.setAttribute('id', domElId.replace('#', ''));
    document.body.appendChild(container);

    appContainer = document.createElement('div');
    container.setAttribute('id', cssSelector.replace('#', ''));
    container.appendChild(appContainer);

    props = { appName: 'test-app', basename: '/demo', dom: container };

    $destroy = jest.fn();
  });

  afterEach(() => {
    document.querySelectorAll(cssSelector).forEach((node) => {
      node.remove();
    });
  });

  it('calls new Vue() during mount and mountedInstances.instance.$destroy() on unmount', async () => {
    const handleInstance = jest.fn();

    const provider = vueBridge({
      Vue,
      appOptions: {},
      handleInstance,
      rootComponent: {},
    });

    const lifeCycles = await provider(props);

    expect(Vue).not.toHaveBeenCalled();
    expect(handleInstance).not.toHaveBeenCalled();
    expect($destroy).not.toHaveBeenCalled();

    lifeCycles.render(props);
    expect(Vue).toHaveBeenCalled();
    expect(handleInstance).toHaveBeenCalled();
    expect($destroy).not.toHaveBeenCalled();

    lifeCycles.destroy(props);
    expect($destroy).toHaveBeenCalled();
  });

  it('appOptions function will recieve the props provided at mount', async () => {
    const appOptions = jest.fn((props) => props);

    const provider = vueBridge({
      Vue,
      appOptions,
      rootComponent: {},
    });

    const lifeCycles = await provider(props);
    lifeCycles.render(props);
    expect(appOptions.mock.calls[0][0]).toBe(props);
    lifeCycles.destroy(props);
  });

  it('handleInstance` function will recieve the props provided at mount', async () => {
    const handleInstance = jest.fn();

    const provider = vueBridge({
      Vue,
      appOptions: {},
      handleInstance,
      rootComponent: {},
    });

    const lifeCycles = await provider(props);
    lifeCycles.render(props);
    expect(handleInstance.mock.calls[0][1]).toBe(props);
    lifeCycles.destroy(props);
  });

  it('implements a render function for you if you provide loadRootComponent', async () => {
    const opts = {
      Vue,
      appOptions: {},
      loadRootComponent: jest.fn(),
      rootComponent: {},
    };

    opts.loadRootComponent.mockReturnValue(Promise.resolve({}));

    const provider = vueBridge(opts);

    const lifeCycles = await provider(props);

    lifeCycles.render(props);
    expect(opts.loadRootComponent).toHaveBeenCalled();
    expect(Vue.mock.calls[0][0].render).toBeDefined();

    lifeCycles.destroy(props);
  });

  it('adds the garfish-vue-bridge props as data to the root component', async () => {
    props.someCustomThing = 'hi';

    const provider = vueBridge({
      Vue,
      appOptions: {},
      rootComponent: {},
    });

    const lifeCycles = await provider(props);

    lifeCycles.render(props);
    expect(Vue).toHaveBeenCalled();
    expect(Vue.mock.calls[0][0].data()).toBeTruthy();
    expect(Vue.mock.calls[0][0].data().appName).toBe('test-app');
    expect(Vue.mock.calls[0][0].data().someCustomThing).toBe('hi');

    lifeCycles.destroy(props);
  });

  it("mounts into the garfish-vue-bridge div if you don't provide an 'el' in appOptions", async () => {
    const provider = vueBridge({
      Vue,
      appOptions: {},
      rootComponent: {},
    });

    const lifeCycles = await provider(props);

    lifeCycles.render(props);
    expect(Vue).toHaveBeenCalled();
    expect(Vue.mock.calls[0][0].el).toBe(container);
    lifeCycles.destroy(props);
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
    const lifeCycles = await provider(props);

    lifeCycles.render(props);

    expect(Vue.createApp).toHaveBeenCalled();
    // Vue 3 requires the data to be a function
    expect(typeof Vue.createApp.mock.calls[0][0].data).toBe('function');
    expect(handleInstance).toHaveBeenCalledWith(appMock, props);
    expect(appMock.mount).toHaveBeenCalled();

    lifeCycles.destroy(props);
    expect(appMock.unmount).toHaveBeenCalled();
  });

  it('works with Vue 3 when you provide the createApp function opt', async () => {
    const createApp = jest.fn();

    const appMock: any = jest.fn();
    appMock.mount = jest.fn();
    appMock.unmount = jest.fn();

    createApp.mockReturnValue(appMock);

    const props = { name: 'vue3-app', dom: container, basename: '/' };

    const handleInstance = jest.fn();

    const provider = vueBridge({
      createApp,
      appOptions: {},
      handleInstance,
      rootComponent: {},
    });
    const lifeCycles = await provider(props);

    lifeCycles.render(props);

    expect(createApp).toHaveBeenCalled();
    // Vue 3 requires the data to be a function
    expect(typeof createApp.mock.calls[0][0].data).toBe('function');
    expect(handleInstance).toHaveBeenCalledWith(appMock, props);
    expect(appMock.mount).toHaveBeenCalled();

    lifeCycles.destroy(props);
    expect(appMock.unmount).toHaveBeenCalled();
  });
});
