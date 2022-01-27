// The logic of reactBridge is referenced from single-spa typography
// Because the Garfish lifecycle does not agree with that of single-spa  part logical coupling in the framework
// https://github.com/single-spa/single-spa-react/blob/main/src/single-spa-react.js

// React context that gives any react component the single-spa props
export let GarfishContext = null;

// try {
//   // garfish-react-bridge is usable as a global script, as a systemjs module, and other
//   // situations where require() is unavailable. This is why we require the user to
//   // pass in opts.React and opts.ReactDOM - to avoid the mess of "how do i properly load react".
//   // However, in situations where require() is available, we can use it this way to create
//   // the react context. The try/catch defensiveness keeps garfish-react-bridge working in
//   // as many situations as possible.
//   // eslint-disable-next-line no-restricted-globals
// GarfishContext = require('react').createContext();
// } catch(e) {
//   // ignore
// }

const defaultOpts = {
  // required opts
  React: null,
  ReactDOM: null,

  // required - one or the other
  rootComponent: null,
  loadRootComponent: null,

  // optional opts
  renderType: null,
  errorBoundary: null,
  errorBoundaryClass: null,
  el: null,
  canUpdate: true, // by default, allow parcels created with garfish-react-bridge to be updated
  suppressComponentDidCatchWarning: false,
  domElements: {},
  renderResults: {},
  updateResolves: {},
};

declare const __GARFISH_EXPORTS__: {
  provider: Object;
};

declare global {
  interface Window {
    __GARFISH__: boolean;
  }
}

export function reactBridge(this: any, userOpts) {
  if (typeof userOpts !== 'object') {
    throw new Error('garfish-react-bridge requires a configuration object');
  }

  const opts = {
    ...defaultOpts,
    ...userOpts,
  };

  if (!opts.React) {
    throw new Error('garfish-react-bridge must be passed opts.React');
  }

  if (!opts.ReactDOM) {
    throw new Error('garfish-react-bridge must be passed opts.ReactDOM');
  }

  if (!opts.rootComponent && !opts.loadRootComponent) {
    throw new Error(
      'garfish-react-bridge must be passed opts.rootComponent or opts.loadRootComponent',
    );
  }

  if (opts.errorBoundary && typeof opts.errorBoundary !== 'function') {
    throw Error(
      'The errorBoundary opt for garfish-react-bridge must either be omitted or be a function that returns React elements',
    );
  }

  if (!GarfishContext && opts.React.createContext) {
    GarfishContext = opts.React.createContext();
  }

  const providerLifeCycle = {
    render: (props) => mount.call(this, opts, props),
    destroy: (props) => unmount.call(this, opts, props),
    update: (props) => opts.canUpdate && update.call(this, opts, props),
  };

  const provider = async function (this: any, appInfo, props) {
    await bootstrap.call(this, opts, appInfo, props);
    return providerLifeCycle;
  };

  if (
    window.__GARFISH__ &&
    typeof __GARFISH_EXPORTS__ === 'object' &&
    __GARFISH_EXPORTS__
  ) {
    __GARFISH_EXPORTS__.provider = provider;
  }
  return provider;
}

function bootstrap(opts, appInfo, props) {
  if (opts.loadRootComponent) {
    // They passed a promise that resolves with the react component. Wait for it to resolve before mounting
    return opts
      .loadRootComponent({
        ...appInfo,
        props,
      })
      .then((resolvedComponent) => {
        opts.rootComponent = resolvedComponent;
      });
  } else {
    // This is a class or stateless function component
    return Promise.resolve();
  }
}

function mount(opts, appInfo, props) {
  if (
    !opts.suppressComponentDidCatchWarning &&
    atLeastReact16(opts.React) &&
    !opts.errorBoundary
  ) {
    if (!opts.rootComponent.prototype) {
      console.warn(
        `garfish-react-bridge: ${
          appInfo.name || appInfo.appName || appInfo.childAppName
        }'s rootComponent does not implement an error boundary.  If using a functional component, consider providing an opts.errorBoundary to reactBridge(opts).`,
      );
    } else if (!opts.rootComponent.prototype.componentDidCatch) {
      console.warn(
        `garfish-react-bridge: ${
          appInfo.name || appInfo.appName || appInfo.childAppName
        }'s rootComponent should implement componentDidCatch to avoid accidentally unmounting the entire garfish application.`,
      );
    }
  }

  const elementToRender = getElementToRender(opts, appInfo, props);
  const domElement = chooseDomElementGetter(opts, appInfo);
  const renderResult = reactDomRender({
    elementToRender,
    domElement,
    opts,
  });
  opts.domElements[appInfo.name] = domElement;
  opts.renderResults[appInfo.name] = renderResult;
}

function unmount(opts, appInfo) {
  const root = opts.renderResults[appInfo.name];

  if (root && root.unmount) {
    // React >= 18
    const unmountResult = root.unmount();
  } else {
    // React < 18
    opts.ReactDOM.unmountComponentAtNode(opts.domElements[appInfo.name]);
  }
  delete opts.domElements[appInfo.name];
  delete opts.renderResults[appInfo.name];
}

function update(opts, appInfo, props) {
  return new Promise((resolve) => {
    if (!opts.updateResolves[props.name]) {
      opts.updateResolves[props.name] = [];
    }

    opts.updateResolves[props.name].push(resolve);

    const elementToRender = getElementToRender(opts, appInfo, props);
    const renderRoot = opts.renderResults[props.name];
    if (renderRoot && renderRoot.render) {
      // React 18 with ReactDOM.createRoot()
      renderRoot.render(elementToRender);
    } else {
      // React 16 / 17 with ReactDOM.render()
      const domElement = chooseDomElementGetter(opts, appInfo);

      // This is the old way to update a react application - just call render() again
      opts.ReactDOM.render(elementToRender, domElement);
    }
  });
}

function atLeastReact16(React) {
  if (
    React &&
    typeof React.version === 'string' &&
    React.version.indexOf('.') >= 0
  ) {
    const majorVersionString = React.version.slice(
      0,
      React.version.indexOf('.'),
    );
    try {
      return Number(majorVersionString) >= 16;
    } catch (err) {
      return false;
    }
  } else {
    return false;
  }
}

function reactDomRender({ opts, elementToRender, domElement }) {
  const renderType =
    typeof opts.renderType === 'function' ? opts.renderType() : opts.renderType;
  if (
    [
      'createRoot',
      'unstable_createRoot',
      'createBlockingRoot',
      'unstable_createBlockingRoot',
    ].indexOf(renderType) >= 0
  ) {
    const root = opts.ReactDOM[renderType](domElement);
    root.render(elementToRender);
    return root;
  }

  if (renderType === 'hydrate') {
    opts.ReactDOM.hydrate(elementToRender, domElement);
  } else {
    // default to this if 'renderType' is null or doesn't match the other options
    opts.ReactDOM.render(elementToRender, domElement);
  }

  // The reactDomRender function should return a react root, but ReactDOM.hydrate() and ReactDOM.render()
  // do not return a react root. So instead, we return null which indicates that there is no react root
  // that can be used for updates or unmounting
  return null;
}

function getElementToRender(opts, appInfo, props = null) {
  const rootComponentElement = opts.React.createElement(
    opts.rootComponent,
    appInfo,
    props,
  );

  let elementToRender = GarfishContext
    ? opts.React.createElement(
        GarfishContext.Provider,
        { value: props },
        rootComponentElement,
      )
    : rootComponentElement;

  if (opts.errorBoundary || opts.errorBoundaryClass) {
    opts.errorBoundaryClass =
      opts.errorBoundaryClass ||
      opts.errorBoundaryClass ||
      createErrorBoundary(opts, props);
    elementToRender = opts.React.createElement(
      opts.errorBoundaryClass,
      appInfo,
      props,
      elementToRender,
    );
  }
  return elementToRender;
}

function createErrorBoundary(opts, props) {
  // Avoiding babel output for class syntax and super()
  // to avoid bloat
  function GarfishSubAppReactErrorBoundary(this: any, props) {
    // super
    opts.React.Component.apply(this, arguments);

    this.state = {
      caughtError: null,
      caughtErrorInfo: null,
    };

    (
      GarfishSubAppReactErrorBoundary as any
    ).displayName = `ReactBridgeReactErrorBoundary(${props.name})`;
  }

  GarfishSubAppReactErrorBoundary.prototype = Object.create(
    opts.React.Component.prototype,
  );

  GarfishSubAppReactErrorBoundary.prototype.render = function () {
    if (this.state.caughtError) {
      const errorBoundary = opts.errorBoundary || props.errorBoundary;

      return errorBoundary(
        this.state.caughtError,
        this.state.caughtErrorInfo,
        this.props,
      );
    } else {
      return this.props.children;
    }
  };

  GarfishSubAppReactErrorBoundary.prototype.componentDidCatch = function (
    err,
    info,
  ) {
    this.setState({
      caughtError: err,
      caughtErrorInfo: info,
    });
  };

  return GarfishSubAppReactErrorBoundary;
}

function chooseDomElementGetter(opts, appInfo) {
  const { dom: container } = appInfo;
  let el;
  if (typeof opts.el === 'string') {
    el = container.querySelector(opts.el);
  } else {
    el = container;
  }

  if (!(el instanceof HTMLElement)) {
    throw Error(
      `react bridge's dom-element-getter-helpers: el is an invalid dom element for application'${
        appInfo.name
      }'. Expected HTMLElement, received ${typeof el}`,
    );
  }
  return el;
}
