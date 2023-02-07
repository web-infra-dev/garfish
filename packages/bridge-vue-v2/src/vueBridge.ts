// The logic of reactBridge is referenced from single-spa typography
// Because the Garfish lifecycle does not agree with that of single-spa  part logical coupling in the framework
// https://github.com/single-spa/single-spa-vue/blob/main/src/single-spa-vue.js

import * as vue from 'vue';
import { UserOptions } from './types';

type Options = UserOptions<vue.VueConstructor, vue.Component>;

const defaultOpts = {
  VueRouter: null,
  // required - one or the other
  rootComponent: null,
  loadRootComponent: null,
  appOptions: null,
  handleInstance: null,
  el: null,
  canUpdate: true, // by default, allow parcels created with garfish-react-bridge to be updated
};

declare const __GARFISH_EXPORTS__: {
  provider: Object;
  registerProvider?: (provider: any) => void;
};

declare global {
  interface Window {
    __GARFISH__: boolean;
  }
}

export function vueBridge(this: any, userOpts: Options) {
  if (typeof userOpts !== 'object') {
    throw new Error('garfish-vue-bridge: requires a configuration object');
  }

  const opts = {
    ...defaultOpts,
    ...userOpts,
  };

  if (
    opts.appOptions &&
    typeof opts.appOptions !== 'function' &&
    opts.appOptions['el'] !== undefined &&
    typeof opts.appOptions['el'] !== 'string' &&
    !((opts.appOptions as any).el instanceof HTMLElement)
  ) {
    throw Error(
      `garfish-vue-bridge: appOptions.el must be a string CSS selector, an HTMLElement, or not provided at all. Was given ${typeof (
        opts.appOptions as any
      ).el}`,
    );
  }
  opts.Vue = opts.Vue || vue.default;

  // Just a shared object to store the mounted object state
  // key - name of single-spa app, since it is unique
  const mountedInstances = {};
  const providerLifeCycle = {
    render: (props) => mount.call(this, opts, mountedInstances, props),
    destroy: (props) => unmount.call(this, opts, mountedInstances, props),
    update: (props) =>
      opts.canUpdate && update.call(this, opts, mountedInstances, props),
  };

  const provider = async function (this: any, appInfo, props) {
    await bootstrap.call(this, opts, appInfo, props);
    return providerLifeCycle;
  };

  // in sandbox env
  if (
    window.__GARFISH__ &&
    typeof __GARFISH_EXPORTS__ === 'object' &&
    __GARFISH_EXPORTS__
  ) {
    if (__GARFISH_EXPORTS__.registerProvider) {
      __GARFISH_EXPORTS__.registerProvider(provider);
    } else {
      __GARFISH_EXPORTS__.provider = provider;
    }
  }
  return provider;
}

function bootstrap(opts: Options, appInfo, props) {
  if (opts.loadRootComponent) {
    return opts
      .loadRootComponent({
        ...appInfo,
        props,
      })
      .then((root) => (opts.rootComponent = root));
  } else {
    return Promise.resolve();
  }
}

function resolveAppOptions(opts, props) {
  if (typeof opts.appOptions === 'function') {
    return opts.appOptions(props);
  }
  return { ...opts.appOptions };
}

function mount(opts: Options, mountedInstances, props) {
  const instance: any = {
    domEl: null,
    vueInstance: null,
    root: null,
  };

  const appOptions = resolveAppOptions(opts, props);

  if (!(props.dom instanceof HTMLElement)) {
    throw Error(
      `garfish-vue-bridge: Garfish runtime provides no dom attributes to mount， ${props.dom}`,
    );
  }

  if (appOptions.el) {
    appOptions.el = props.dom.querySelector(appOptions.el);
    if (!appOptions.el) {
      throw Error(
        `If appOptions.el is provided to garfish, the dom element must exist in the dom. Was provided as ${appOptions.el}.If use js as sub application entry resource please don't provider el options`,
      );
    }
  } else {
    appOptions.el = props.dom;
  }

  instance.domEl = appOptions.el;

  if (!appOptions.render && !appOptions.template && opts.rootComponent) {
    // it works for vue2, in vue3 `h` in imported from `vue'` instead of passing it through the render function
    appOptions.render = (h) => h(opts.rootComponent);
  }

  if (!appOptions.data) {
    appOptions.data = {};
  }

  appOptions.data = () => ({ ...appOptions.data, ...props });

  // vue2 el options will auto replace render dom，garfish cache mode can't replace render dom https://cn.vuejs.org/v2/api/#el
  delete appOptions.el;
  if (opts && opts.Vue) {
    instance.vueInstance = new opts.Vue(appOptions);
    instance.vueInstance.$mount();
    instance.domEl.appendChild(instance.vueInstance.$el);
    if (instance.vueInstance.bind) {
      instance.vueInstance = instance.vueInstance.bind(instance.vueInstance);
    }
    if (opts.handleInstance) {
      opts.handleInstance(instance.vueInstance, props);
      mountedInstances[props.appName] = instance;
      return instance.vueInstance;
    }
  }

  mountedInstances[props.appName] = instance;
  return instance.vueInstance;
}

function update(opts: Options, mountedInstances, props) {
  const instance = mountedInstances[props.appName];

  const appOptions = resolveAppOptions(opts, props);
  const data = {
    ...(appOptions.data || {}),
    ...props,
  };
  const root = instance.root || instance.vueInstance;
  for (const prop in data) {
    root[prop] = data[prop];
  }
}

function unmount(opts: Options, mountedInstances, props) {
  const instance = mountedInstances[props.appName];

  instance.vueInstance.$destroy();
  instance.vueInstance.$el.innerHTML = '';

  delete instance.vueInstance;

  if (instance.domEl) {
    instance.domEl.innerHTML = '';
    delete instance.domEl;
  }
}
