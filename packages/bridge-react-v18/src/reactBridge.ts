// The logic of reactBridge is referenced from single-spa typography
// Because the Garfish lifecycle does not agree with that of single-spa  part logical coupling in the framework
// https://github.com/single-spa/single-spa-react/blob/main/src/single-spa-react.js

import * as React from 'react';
import { createRoot, hydrateRoot, Root } from 'react-dom/client';
import type { UserOptions, AppInfo } from './types';

type typeReact = typeof React;

type Options = UserOptions<
  typeof React,
  typeof createRoot,
  typeof hydrateRoot,
  Root,
  React.ComponentType,
  React.ReactNode
>;

const defaultOpts = {
  // required - one or the other or both
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

export function reactBridge(this: any, userOpts: Options) {
  if (typeof userOpts !== 'object') {
    throw new Error('garfish-react-bridge requires a configuration object');
  }

  const opts: Options = {
    ...defaultOpts,
    ...userOpts,
  };

  opts.React = opts.React || React;
  opts.createRoot = opts.createRoot || createRoot;
  opts.hydrateRoot = opts.hydrateRoot || hydrateRoot;

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
  if (!atLeastReact18(opts.React)) {
    throw Error(
      'Please make sure than the react version is higher than or equal to v18.',
    );
  }

  const providerLifeCycle = {
    render: (appInfo: AppInfo) => mount.call(this, opts, appInfo),
    destroy: (appInfo: AppInfo) => unmount.call(this, opts, appInfo),
    // update: (appInfo: AppInfo) =>
    //   opts.canUpdate && update.call(this, opts, appInfo),
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

function bootstrap(opts: Options, appInfo, props) {
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

function mount(opts: Options, appInfo: AppInfo) {
  if (
    !opts.suppressComponentDidCatchWarning &&
    atLeastReact18(opts.React) &&
    !opts.errorBoundary
  ) {
    if (!opts.rootComponent.prototype) {
      console.warn(
        `garfish-react-bridge: ${appInfo.appName}'s rootComponent does not implement an error boundary.  If using a functional component, consider providing an opts.errorBoundary to reactBridge(opts).`,
      );
    } else if (!opts.rootComponent.prototype.componentDidCatch) {
      console.warn(
        `garfish-react-bridge: ${appInfo.appName}'s rootComponent should implement componentDidCatch to avoid accidentally unmounting the entire garfish application.`,
      );
    }
  }

  const elementToRender = getElementToRender(opts, appInfo);
  const domElement = chooseDomElementGetter(opts, appInfo);
  const renderResult = callCreateRoot({
    elementToRender,
    domElement,
    opts,
  });

  opts.domElements[appInfo.appName] = domElement;
  opts.renderResults[appInfo.appName] = renderResult;
}

function unmount(opts: Options, appInfo: AppInfo) {
  const root = opts.renderResults[appInfo.appName];
  root.unmount();
  delete opts.domElements[appInfo.appName];
  delete opts.renderResults[appInfo.appName];
}

// function update(opts: Options, appInfo: AppInfo) {
//   return new Promise((resolve) => {
//     if (!opts.updateResolves[appInfo.appName]) {
//       opts.updateResolves[appInfo.appName] = [];
//     }

//     opts.updateResolves[appInfo.appName].push(resolve);
//     const elementToRender = getElementToRender(opts, appInfo);
//     const renderRoot = opts.renderResults[appInfo.appName];
//     renderRoot.render(elementToRender);
//   });
// }

function atLeastReact18(React: typeReact) {
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
      return Number(majorVersionString) >= 18;
    } catch (err) {
      return false;
    }
  } else {
    return false;
  }
}

function callCreateRoot({ opts, elementToRender, domElement }) {
  const renderType =
    typeof opts.renderType === 'function' ? opts.renderType() : opts.renderType;

  let root;
  if (renderType === 'hydrate') {
    root = opts.hydrateRoot(elementToRender, domElement);
    root.render(elementToRender);
  } else {
    // default to this if 'renderType' is null or doesn't match the other options
    root = opts.createRoot(domElement);
    root.render(elementToRender);
  }

  return root;
}

function getElementToRender(opts: Options, appInfo: AppInfo) {
  const rootComponentElement = opts.React.createElement(
    opts.rootComponent as any,
    appInfo,
  );

  let elementToRender = rootComponentElement;

  if (opts.errorBoundary || opts.errorBoundaryClass) {
    opts.errorBoundaryClass =
      opts.errorBoundaryClass ||
      opts.errorBoundaryClass ||
      createErrorBoundary(opts);
    elementToRender = opts.React.createElement(
      opts.errorBoundaryClass as any,
      appInfo,
      elementToRender,
    );
  }
  return elementToRender;
}

function createErrorBoundary(opts: Options) {
  // Avoiding babel output for class syntax and super()
  // to avoid bloat
  function GarfishSubAppReactErrorBoundary(this: any, appInfo: AppInfo) {
    // super
    opts.React.Component.apply(this, arguments);

    this.state = {
      caughtError: null,
      caughtErrorInfo: null,
    };

    (
      GarfishSubAppReactErrorBoundary as any
    ).displayName = `ReactBridgeReactErrorBoundary(${appInfo.appName})`;
  }

  GarfishSubAppReactErrorBoundary.prototype = Object.create(
    opts.React.Component.prototype,
  );

  GarfishSubAppReactErrorBoundary.prototype.render = function () {
    if (this.state.caughtError) {
      const errorBoundary = opts.errorBoundary;

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

function chooseDomElementGetter(opts: Options, appInfo: AppInfo) {
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
