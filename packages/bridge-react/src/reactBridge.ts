// The logic of reactBridge is referenced from single-spa typography
// Because the Garfish lifecycle does not agree with that of single-spa  part logical coupling in the framework
// https://github.com/single-spa/single-spa-react/blob/main/src/single-spa-react.js

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import type { UserOptions, PropsInfo } from './types';
import { warn } from '@garfish/utils';

type typeReact = typeof React | undefined;
type Options = UserOptions<typeof React, typeof ReactDOM, any, React.ReactNode>;

const defaultOpts = {
  // required - one or the other or both
  rootComponent: undefined,
  loadRootComponent: undefined,

  // optional opts
  renderType: undefined,
  errorBoundary: undefined,
  el: undefined,
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

export function reactBridge(this: any, userOptions: Options) {
  if (typeof userOptions !== 'object') {
    throw new Error('garfish-react-bridge requires a configuration object');
  }

  const opts: Options = {
    ...defaultOpts,
    ...userOptions,
  };

  opts.React = opts.React || React;
  opts.ReactDOM = opts.ReactDOM || ReactDOM;

  if (!opts.rootComponent && !opts.loadRootComponent) {
    throw new Error(
      'garfish-react-bridge must be passed opts.rootComponent or opts.loadRootComponent',
    );
  }

  if (opts.rootComponent && opts.loadRootComponent) {
    warn(
      'garfish-react-bridge: `RootComponent` will be ignored for the reason you have passed both `rootComponent` and `loadRootComponent`.',
    );
  }

  if (opts.errorBoundary && typeof opts.errorBoundary !== 'function') {
    throw Error(
      'The errorBoundary opt for garfish-react-bridge must either be omitted or be a function that returns React elements',
    );
  }
  if (!checkReactVersion(opts.React)) {
    throw Error(
      'Please make sure than the react version is higher than or equal to v16 and lower than v18.',
    );
  }

  const providerLifeCycle = {
    render: (appInfo) => mount.call(this, opts, appInfo),
    destroy: (appInfo) => unmount.call(this, opts, appInfo),
    // update: (appInfo) => opts.canUpdate && update.call(this, opts, appInfo),
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

function bootstrap(opts: Options, appInfo: PropsInfo, props) {
  if (opts.loadRootComponent) {
    // They passed a promise that resolves with the react component. Wait for it to resolve before mounting
    try {
      return opts
        .loadRootComponent({
          ...appInfo,
          props,
        })
        .then((resolvedComponent) => {
          opts.rootComponent = resolvedComponent;
        });
    } catch (error) {
      console.error('error log by garfish: loadRootComponent error:', error);
      throw new Error(error);
    }
  } else {
    // This is a class or stateless function component
    return Promise.resolve();
  }
}

function mount(opts: Options, appInfo: PropsInfo) {
  if (
    !opts.suppressComponentDidCatchWarning &&
    checkReactVersion(opts.React) &&
    !opts.errorBoundary
  ) {
    if (opts.rootComponent && !opts.rootComponent.prototype) {
      warn(
        `garfish-react-bridge: ${appInfo.appName}'s rootComponent does not implement an error boundary.  If using a functional component, consider providing an opts.errorBoundary to reactBridge(opts).`,
      );
    } else if (
      opts.rootComponent &&
      !opts.rootComponent.prototype.componentDidCatch
    ) {
      warn(
        `garfish-react-bridge: ${appInfo.appName}'s rootComponent should implement componentDidCatch to avoid accidentally unmounting the entire garfish application.`,
      );
    }
  }

  const elementToRender = getElementToRender(opts, appInfo);
  const domElement = chooseDomElementGetter(opts, appInfo);
  const renderResult = reactDomRender({
    elementToRender,
    domElement,
    opts,
  });
  opts.domElements ? (opts.domElements[appInfo.appName] = domElement) : '';
  // opts.renderResults[appInfo.appName] = renderResult;
}

function unmount(opts: Options, appInfo: PropsInfo) {
  if (opts.domElements) {
    opts.ReactDOM &&
      opts.ReactDOM.unmountComponentAtNode(opts.domElements[appInfo.appName]);
    delete opts.domElements[appInfo.appName];
    // delete opts.renderResults[appInfo.appName];
  }
}

// function update(opts, appInfo: PropsInfo) {
//   return new Promise((resolve) => {
//     if (!opts.updateResolves[appInfo.appName]) {
//       opts.updateResolves[appInfo.appName] = [];
//     }

//     opts.updateResolves[appInfo.appName].push(resolve);

//     const elementToRender = getElementToRender(opts, appInfo);
//     const domElement = chooseDomElementGetter(opts, appInfo);

//     // This is the old way to update a react application - just call render() again
//     opts.ReactDOM.render(elementToRender, domElement);
//   });
// }

function checkReactVersion(React: typeReact) {
  if (
    React &&
    typeof React.version === 'string' &&
    React.version.indexOf('.') >= 0
  ) {
    const majorVersionString = React.version.split('.')[0];
    try {
      return (
        Number(majorVersionString) >= 16 && Number(majorVersionString) < 18
      );
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

function getElementToRender(opts: Options, appInfo: PropsInfo) {
  if (opts.React) {
    const rootComponentElement = opts.React.createElement(
      opts.rootComponent,
      appInfo,
    );
    let elementToRender = rootComponentElement;

    if (opts.errorBoundary) {
      elementToRender = opts.React.createElement(
        createErrorBoundary(opts) as any,
        appInfo,
        elementToRender,
      );
    }
    return rootComponentElement;
  }
}

function createErrorBoundary(opts: Options) {
  // Avoiding babel output for class syntax and super()
  // to avoid bloat
  function GarfishSubAppReactErrorBoundary(this: any, props) {
    // super
    opts.React && opts.React.Component.apply(this, arguments);

    this.state = {
      caughtError: null,
      caughtErrorInfo: null,
    };

    (
      GarfishSubAppReactErrorBoundary as any
    ).displayName = `ReactBridgeReactErrorBoundary(${props.name})`;
  }

  GarfishSubAppReactErrorBoundary.prototype =
    opts.React && Object.create(opts.React.Component.prototype);

  GarfishSubAppReactErrorBoundary.prototype.render = function () {
    if (this.state.caughtError) {
      const errorBoundary = opts.errorBoundary;
      return errorBoundary && errorBoundary(this.state.caughtError, this.props);
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

function chooseDomElementGetter(opts: Options, appInfo: PropsInfo) {
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
        appInfo.appName
      }'. Expected HTMLElement, received ${typeof el}`,
    );
  }
  return el;
}
