import Garfish from '@garfish/core';
import { GarfishRouter } from '@garfish/router';
import { GarfishLoader } from '@garfish/loader';
import { GarfishBrowserVm } from '@garfish/browser-vm';
import { GarfishBrowserSnapshot } from '@garfish/browser-snapshot';
import { def, warn, hasOwn, inBrowser, __GARFISH_FLAG__ } from '@garfish/utils';

declare global {
  interface Window {
    Garfish: Garfish;
    __GARFISH__: boolean;
  }
}

// Initialize the Garfish, currently existing environment to allow only one instance (export to is for test)
function createContext(): Garfish {
  let fresh = false;
  // Existing garfish instance, direct return
  if (inBrowser() && window['__GARFISH__'] && window['Garfish']) {
    return window['Garfish'];
  }

  const GarfishInstance = new Garfish({
    plugins: [GarfishRouter(), GarfishBrowserVm(), GarfishBrowserSnapshot(), GarfishLoader()],
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

export const GarfishInstance = createContext();
