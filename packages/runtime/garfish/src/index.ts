import { Garfish } from '@garfish/core';
import GarfishRouter from '@garfish/router';
import GarfishBrowserVm from '@garfish/browser-vm';
import GarfishBrowserSnapshot from '@garfish/browser-snapshot';
import {
  def,
  warn,
  hasOwn,
  inBrowser,
  __GARFISH_FLAG__,
  error,
} from '@garfish/utils';

declare global {
  interface Window {
    Garfish: Garfish;
    __GARFISH__: boolean;
    __PROWER_BY_GAR__: boolean;
  }
}

// Initialize the Garfish, currently existing environment to allow only one instance (export to is for test)
export function createContext(): Garfish {
  let fresh = false;
  // Existing garfish instance, direct return
  if (inBrowser() && window['__GARFISH__'] && window['Garfish'])
    return window['Garfish'];

  const GarfishInstance = new Garfish({
    apps: [],
    basename: '',
    domGetter: () => null,
    sandbox: {
      snapshot: false,
      useStrict: false,
      strictIsolation: false,
    },
    autoRefreshApp: true,
    disableStatistics: false,
    disablePreloadApp: false,
    nested: false,
    beforeLoad: async () => {},
    afterLoad: () => {},
    beforeEval: () => {},
    afterEval: () => {},
    beforeMount: () => {},
    afterMount: () => {},
    beforeUnmount: () => {},
    afterUnmount: () => {},
    errorLoadApp: (err) => error(err),
    errorMountApp: (err) => error(err),
    errorUnmountApp: (err) => error(err),
    onNotMatchRouter: () => {},
    plugins: [GarfishRouter(), GarfishBrowserVm(), GarfishBrowserSnapshot()],
  });

  type globalValue = boolean | Garfish | Record<string, unknown>;
  const set = (namespace: string, val: globalValue = GarfishInstance) => {
    if (hasOwn(window, namespace)) {
      if (!(window[namespace] && window[namespace].flag === __GARFISH_FLAG__)) {
        const next = () => {
          fresh = true;
          if (__DEV__) {
            warn(`"Window.${namespace}" will be overwritten by "garfish".`);
          }
        };
        const desc = Object.getOwnPropertyDescriptor(window, namespace);
        if (desc) {
          if (desc.configurable) {
            def(window, namespace, val);
            next();
          } else if (desc.writable) {
            window[namespace] = val;
            next();
          }
        }
      }
    } else {
      fresh = true;
      def(window, namespace, val);
    }
  };

  if (inBrowser()) {
    // Global flag
    set('Garfish');
    set('Gar');
    set('Garfish');
    def(window, '__GARFISH__', true);
  }

  if (fresh) {
    if (__DEV__) {
      if (__VERSION__ !== window['Garfish'].version) {
        warn(
          'The "garfish version" used by the main and sub-applications is inconsistent.',
        );
      }
    }
  }
  return GarfishInstance;
}

export { interfaces } from '@garfish/core';
export { Garfish } from '@garfish/core';
export default createContext();
