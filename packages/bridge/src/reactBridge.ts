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

export function reactBridge(userOpts) {
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

  const provider = async function (props) {
    await bootstrap.call(this, opts, props);
    return {
      render: (props) => mount.call(this, opts, props),
      destroy: (props) => unmount.call(this, opts, props),
      update: (props) => opts.canUpdate && update.call(this, opts, props),
    };
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

function bootstrap(opts, props) {
  if (opts.rootComponent) {
    // This is a class or stateless function component
    return Promise.resolve();
  } else {
    // They passed a promise that resolves with the react component. Wait for it to resolve before mounting
    return opts.loadRootComponent(props).then((resolvedComponent) => {
      opts.rootComponent = resolvedComponent;
    });
  }
}

function mount(opts, props) {
  return new Promise((resolve) => {
    if (
      !opts.suppressComponentDidCatchWarning &&
      atLeastReact16(opts.React) &&
      !opts.errorBoundary
    ) {
      if (!opts.rootComponent.prototype) {
        console.warn(
          `garfish-react-bridge: ${
            props.name || props.appName || props.childAppName
          }'s rootComponent does not implement an error boundary.  If using a functional component, consider providing an opts.errorBoundary to reactBridge(opts).`,
        );
      } else if (!opts.rootComponent.prototype.componentDidCatch) {
        console.warn(
          `garfish-react-bridge: ${
            props.name || props.appName || props.childAppName
          }'s rootComponent should implement componentDidCatch to avoid accidentally unmounting the entire garfish application.`,
        );
      }
    }

    const whenMounted = function () {
      resolve(this);
    };

    const elementToRender = getElementToRender(opts, props, whenMounted);
    const domElement = chooseDomElementGetter(opts, props);
    const renderResult = reactDomRender({
      elementToRender,
      domElement,
      opts,
    });
    opts.domElements[props.name] = domElement;
    opts.renderResults[props.name] = renderResult;
  });
}

function unmount(opts, props) {
  return new Promise((resolve) => {
    opts.unmountFinished = resolve;

    const root = opts.renderResults[props.name];

    if (root && root.unmount) {
      // React >= 18
      const unmountResult = root.unmount();
    } else {
      // React < 18
      opts.ReactDOM.unmountComponentAtNode(opts.domElements[props.name]);
    }
    delete opts.domElements[props.name];
    delete opts.renderResults[props.name];
  });
}

function update(opts, props) {
  return new Promise((resolve) => {
    if (!opts.updateResolves[props.name]) {
      opts.updateResolves[props.name] = [];
    }

    opts.updateResolves[props.name].push(resolve);

    const elementToRender = getElementToRender(opts, props, null);
    const renderRoot = opts.renderResults[props.name];
    if (renderRoot && renderRoot.render) {
      // React 18 with ReactDOM.createRoot()
      renderRoot.render(elementToRender);
    } else {
      // React 16 / 17 with ReactDOM.render()
      const domElement = chooseDomElementGetter(opts, props);

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

function getElementToRender(opts, props, mountFinished) {
  const rootComponentElement = opts.React.createElement(
    opts.rootComponent,
    props,
  );

  let elementToRender = GarfishContext
    ? opts.React.createElement(
        GarfishContext.Provider,
        { value: props },
        rootComponentElement,
      )
    : rootComponentElement;

  if (
    opts.errorBoundary ||
    props.errorBoundary ||
    opts.errorBoundaryClass ||
    props.errorBoundaryClass
  ) {
    opts.errorBoundaryClass =
      opts.errorBoundaryClass ||
      props.errorBoundaryClass ||
      createErrorBoundary(opts, props);
    elementToRender = opts.React.createElement(
      opts.errorBoundaryClass,
      props,
      elementToRender,
    );
  }

  // https://github.com/single-spa/single-spa-react/issues/112
  elementToRender = opts.React.createElement(
    GarfishSubAppRoot,
    {
      ...props,
      mountFinished,
      updateFinished() {
        if (opts.updateResolves[props.name]) {
          opts.updateResolves[props.name].forEach((r) => r());
          delete opts.updateResolves[props.name];
        }
      },
      unmountFinished() {
        setTimeout(opts.unmountFinished);
      },
    },
    elementToRender,
  );

  // This is a class component, since we need a mount hook and garfish-react-bridge supports React@15 (no useEffect available)
  function GarfishSubAppRoot(_props) {
    // eslint-disable-next-line no-restricted-globals
    // SingleSpaRoot.displayName = `SingleSpaRoot(${_props.name})`;
  }

  GarfishSubAppRoot.prototype = Object.create(opts.React.Component.prototype);
  GarfishSubAppRoot.prototype.componentDidMount = function () {
    setTimeout(this.props.mountFinished);
  };
  GarfishSubAppRoot.prototype.componentWillUnmount = function () {
    setTimeout(this.props.unmountFinished);
  };
  GarfishSubAppRoot.prototype.render = function () {
    // componentDidUpdate doesn't seem to be called during root.render() for updates
    setTimeout(this.props.updateFinished);
    return this.props.children;
  };

  return elementToRender;
}

function createErrorBoundary(opts, props) {
  // Avoiding babel output for class syntax and super()
  // to avoid bloat
  function GarfishSubAppReactErrorBoundary(props) {
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

function chooseDomElementGetter(opts, props) {
  const { dom: container } = props;
  let el;
  if (typeof opts.el === 'string') {
    el = container.querySelector(opts.el);
  } else {
    el = container;
  }

  if (!(el instanceof HTMLElement)) {
    throw Error(
      `react bridge's dom-element-getter-helpers: el is an invalid dom element for application'${
        props.name
      }'. Expected HTMLElement, received ${typeof el}`,
    );
  }
  return el;
}
