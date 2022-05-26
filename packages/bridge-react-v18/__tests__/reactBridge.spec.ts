// The logic of vue-bridge-test is referenced from single-spa typography
// Because the Garfish lifecycle does not agree with that of single-spa  part logical coupling in the framework
// https://github.com/single-spa/single-spa-vue/blob/main/src/single-spa-vue.test.js

import { reactBridge } from '../src/reactBridge';
import '@testing-library/jest-dom';

const domElId = '#sub-app-container';
const cssSelector = '#app';

describe('react-bridge', () => {
  let React,
    createRoot,
    hydrateRoot,
    props,
    appInfo,
    appContainer,
    container,
    rootComponent,
    loadRootComponent,
    $el,
    rootInstanceMock,
    hydrateRootInstanceMock,
    $createElement,
    $render,
    $unmount,
    errorBoundary;

  beforeEach(() => {
    React = {
      createElement: $createElement,
      version: '18.1.0',
    };

    createRoot = jest.fn();
    rootInstanceMock = jest.fn();
    rootInstanceMock.render = $render;
    rootInstanceMock.unmount = $unmount;
    createRoot.mockReturnValue(rootInstanceMock);

    hydrateRoot = jest.fn();
    hydrateRootInstanceMock = jest.fn();
    hydrateRootInstanceMock.render = $render;
    hydrateRootInstanceMock.unmount = $unmount;
    hydrateRoot.mockReturnValue(hydrateRootInstanceMock);

    container = document.createElement('div');
    container.setAttribute('id', domElId.replace('#', ''));
    document.body.appendChild(container);

    appContainer = document.createElement('div');
    container.setAttribute('id', cssSelector.replace('#', ''));
    container.appendChild(appContainer);

    $el = '#app2';

    appInfo = {
      appName: 'test-app',
      basename: '/demo',
      dom: container,
    };
    props = {
      store: { counter: 100 },
    };

    $createElement = jest.fn();
    $render = jest.fn();
    $unmount = jest.fn();
    rootComponent = jest.fn();
    loadRootComponent = jest.fn();
    errorBoundary = jest.fn();
  });

  afterEach(() => {
    document.querySelectorAll(cssSelector).forEach((node) => {
      node.remove();
    });
  });

  it('throws an error when required parameters are not provided', () => {
    expect(() => reactBridge(null as any)).toThrow();
    expect(() => reactBridge({} as any)).toThrow();
    expect(() => reactBridge({ el: $el } as any)).toThrow();
    expect(() => reactBridge({ createRoot } as any)).toThrow();
    expect(() => reactBridge({ loadRootComponent })).not.toThrow();
    expect(() => reactBridge({ rootComponent })).not.toThrow();
    expect(() => reactBridge({ el: $el, rootComponent })).not.toThrow();
    expect(() => reactBridge({ createRoot, rootComponent })).not.toThrow();
    expect(() => reactBridge({ hydrateRoot, rootComponent })).not.toThrow();

    expect(() =>
      reactBridge({
        createRoot,
        hydrateRoot,
        el: $el,
        rootComponent,
      }),
    ).not.toThrow();

    expect(() =>
      reactBridge({
        createRoot,
        hydrateRoot,
        el: $el,
        loadRootComponent,
        errorBoundary,
      }),
    ).not.toThrow();
  });

  it('throws an error when react version is lower then react v18', async () => {
    expect(() =>
      reactBridge({
        React: {
          ...React,
          version: '15.2.0',
        },
        createRoot,
        rootComponent,
      }),
    ).toThrow();
  });

  it('throws an error when opts.el is provided and opts.el.dom does not exist in the dom during mount', async () => {
    const provider = reactBridge({
      React,
      createRoot,
      el: '#invalid_app',
      rootComponent,
    });

    const lifeCycles = await provider(appInfo, props);
    expect(() => lifeCycles.render({ ...appInfo, props })).toThrow();
  });

  it('throws an error when opts.errorBoundary is provided and the type is not function', async () => {
    expect(() =>
      reactBridge({
        React,
        createRoot,
        loadRootComponent,
        errorBoundary: {} as any,
      }),
    ).toThrow();
  });

  it('function called when mounts and unmounts a React component', async () => {
    const provider = reactBridge({
      React,
      createRoot,
      rootComponent,
    });

    const lifeCycles = await provider(appInfo, props);
    expect(createRoot).not.toHaveBeenCalled();

    lifeCycles.render({ ...appInfo, props });
    expect(createRoot).toHaveBeenCalled();
    expect(rootInstanceMock.render).toHaveBeenCalled();
    expect(rootInstanceMock.unmount).not.toHaveBeenCalled();

    lifeCycles.destroy({ ...appInfo, props });
    expect(rootInstanceMock.unmount).toHaveBeenCalled();
  });

  it("mounts and unmounts a React component with a 'renderType' of 'hydrate'", async () => {
    const provider = reactBridge({
      React,
      createRoot,
      hydrateRoot,
      rootComponent,
      renderType: 'hydrate',
    });

    const lifeCycles = await provider(appInfo, props);
    expect(hydrateRoot).not.toHaveBeenCalled();

    lifeCycles.render({ ...appInfo, props });
    expect(hydrateRoot).toHaveBeenCalled();

    expect(hydrateRootInstanceMock.render).toHaveBeenCalled();
    expect(hydrateRootInstanceMock.unmount).not.toHaveBeenCalled();

    lifeCycles.destroy({ ...appInfo, props });
    expect(hydrateRootInstanceMock.unmount).toHaveBeenCalled();
  });

  it('implements a render function for you if you provide loadRootComponent', async () => {
    const opts = {
      React,
      createRoot,
      loadRootComponent,
    };

    opts.loadRootComponent.mockReturnValue(Promise.resolve({}));

    const provider = reactBridge(opts);
    const lifeCycles = await provider(appInfo, props);
    lifeCycles.render({ ...appInfo, props });
    expect(opts.loadRootComponent).toHaveBeenCalled();
  });

  it('loadRootComponent function will recieve the props provided at mount', async () => {
    const opts = {
      React,
      createRoot,
      loadRootComponent,
    };
    opts.loadRootComponent.mockReturnValue(Promise.resolve({}));

    const provider = reactBridge({
      React,
      createRoot,
      loadRootComponent,
    });

    const lifeCycles = await provider(appInfo, props);
    lifeCycles.render({ ...appInfo, props });
    expect(loadRootComponent.mock.calls[0][0]).toEqual({ ...appInfo, props });
    expect(loadRootComponent.mock.calls[0][0].appName).toBe('test-app');
    expect(loadRootComponent.mock.calls[0][0].props.store.counter).toBe(100);

    lifeCycles.destroy({ ...appInfo, props });
  });

  describe('opts.el', () => {
    it("mounts into the div you provided in the opts.el if you provide an 'el' in opts", async () => {
      const opts = {
        React,
        createRoot,
        rootComponent,
        el: '#test_el',
      };
      const $testEl = document.createElement('div');
      $testEl.setAttribute('id', 'test_el');
      container.appendChild($testEl);

      const provider = reactBridge(opts);
      const lifeCycles = await provider(appInfo, props);

      lifeCycles.render({ ...appInfo, props });
      expect(React.createElement).toHaveBeenCalled();
      expect(document.getElementById('test_el')).toBeInTheDocument();
      expect(document.getElementById('test_el')).not.toBeNull;
      expect(document.getElementById('test_el').children).not.toBeNull;
      expect(document.getElementById('app')).toBeNull;
    });

    it("mounts into the garfish-react-bridge div if you don't provide an 'el' in opts", async () => {
      const opts = {
        React,
        createRoot,
        rootComponent,
      };

      const provider = reactBridge(opts);
      const lifeCycles = await provider(appInfo, props);

      lifeCycles.render({ ...appInfo, props });
      expect(React.createElement).toHaveBeenCalled();
      expect(document.getElementById('app')).not.toBeNull;
      expect(document.getElementById('app').children).not.toBeNull;
    });
  });
});
