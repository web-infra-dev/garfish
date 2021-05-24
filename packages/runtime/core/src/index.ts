import { Garfish } from './garfish';
import GarfishRouter from '@garfish/router';
import GarfishCjsExternal from '@garfish/cjs-external';
import GarfishHMRPlugin from './plugins/fixHMR';
import GarfishOptionsLife from './plugins/lifecycle';
import { def, hasOwn, warn } from '@garfish/utils';
import { __GARFISH_FLAG__ } from './utils/tool';

// Initialize the Garfish, currently existing environment to allow only one instance (export to is for test)
export function createContext() {
  let fresh = false;
  const GarfishInstance = new Garfish({
    plugins: [
      GarfishCjsExternal(),
      GarfishRouter(),
      GarfishHMRPlugin(),
      GarfishOptionsLife(),
    ],
  });

  type globalValue = boolean | Garfish | Record<string, unknown>;
  const set = (namespace: string, val: globalValue = GarfishInstance) => {
    if (hasOwn(window, namespace)) {
      if (!(window[namespace] && window[namespace].flag === __GARFISH_FLAG__)) {
        const next = () => {
          fresh = true;
          if (__DEV__) {
            warn(
              `"Window.${namespace}" will be overwritten by "@garfish/core".`,
            );
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
      } else if (
        window[namespace] &&
        window[namespace].flag === __GARFISH_FLAG__
      ) {
        // Nested scene
        window[namespace].subInstances.push(GarfishInstance);
      }
    } else {
      fresh = true;
      def(window, namespace, val);
    }
  };

  set('Gar');
  set('Garfish');

  // 全局标识符
  set('__GAR__', true);
  set('__GARFISH__', true);

  if (fresh) {
    if (__DEV__) {
      if (__VERSION__ !== window['Garfish'].version) {
        warn(
          'The "garfish version" used by the main and sub-applications is inconsistent.',
        );
      }
    }
  }
  return window['Garfish'];
}

export { interfaces } from './interface';
export { Garfish } from './garfish';
export default createContext();
