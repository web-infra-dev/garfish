// The logic of vue-bridge-test is referenced from single-spa typography
// Because the Garfish lifecycle does not agree with that of single-spa  part logical coupling in the framework
// https://github.com/single-spa/single-spa-vue/blob/main/src/single-spa-vue.test.js

import { vueBridge } from '../src/vueBridge';
const domElId = '#sub-app-container';
const cssSelector = '#app';

interface Vue {
  $el: Element;
  $destroy: (...args: Array<any>) => void;
  $mount: (...args: Array<any>) => void;
}

describe('vue-v2-bridge', () => {
  let vue,
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
    vue = jest.fn();

    vue.mockImplementation(function (this: Vue) {
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

  it('calls new vue() during mount and mountedInstances.instance.$destroy() on unmount', async () => {
    const handleInstance = jest.fn();
    const provider = vueBridge({
      Vue: vue,
      appOptions: {} as any,
      handleInstance,
      rootComponent,
    });

    const lifeCycles = await provider(appInfo, props);

    expect(vue).not.toHaveBeenCalled();
    expect(handleInstance).not.toHaveBeenCalled();
    expect($destroy).not.toHaveBeenCalled();

    lifeCycles.render({ ...appInfo, props });

    expect(vue).toHaveBeenCalled();
    expect(handleInstance).toHaveBeenCalled();
    expect($destroy).not.toHaveBeenCalled();

    lifeCycles.destroy({ ...appInfo, props });
    expect($destroy).toHaveBeenCalled();
  });

  it('appOptions function will recieve the props provided at mount', async () => {
    const appOptions = jest.fn((props) => props);

    const provider = vueBridge({
      Vue: vue,
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
      Vue: vue,
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
      Vue: vue,
      appOptions: {},
      loadRootComponent,
      rootComponent: {},
    };

    opts.loadRootComponent.mockReturnValue(Promise.resolve({}));

    const provider = vueBridge(opts as any);

    const lifeCycles = await provider(appInfo, props);

    lifeCycles.render({ ...appInfo, props });
    expect(opts.loadRootComponent).toHaveBeenCalled();
    expect(vue.mock.calls[0][0].render).toBeDefined();

    lifeCycles.destroy({ ...appInfo, props });
  });

  it('adds the garfish-vue-bridge props as data to the root component', async () => {
    props.someCustomThing = 'hi';

    const provider = vueBridge({
      Vue: vue,
      appOptions: {} as any,
      rootComponent: {},
    });

    const lifeCycles = await provider(appInfo, props);

    lifeCycles.render({ ...appInfo, props });
    expect(vue).toHaveBeenCalled();
    expect(vue.mock.calls[0][0].data()).toBeTruthy();
    expect(vue.mock.calls[0][0].data().appName).toBe('test-app');
    expect(vue.mock.calls[0][0].data().props.store.counter).toBe(100);

    lifeCycles.destroy({ ...appInfo, props });
  });

  // eslint-disable-next-line quotes
  it("mounts into the garfish-vue-bridge div if you don't provide an 'el' in appOptions", async () => {
    const provider = vueBridge({
      Vue: vue,
      appOptions: {} as any,
      rootComponent: {},
    });

    const lifeCycles = await provider(appInfo, props);

    lifeCycles.render({ ...appInfo, props });
    expect(vue).toHaveBeenCalled();
    expect(container.contains($el)).toEqual(true);
    lifeCycles.destroy({ ...appInfo, props });
  });
});
