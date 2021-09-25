import GarfishInstance, { interfaces } from 'garfish';
import './monitoring';

declare const Cypress: any;

(window as any).__GARFISH_PARENT__ = true;

// let asyncTime = function () {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(true);
//     }, 3000);
//   });
// };
let defaultConfig: interfaces.Options = {
  basename: '/garfish_master',
  domGetter: () => {
    // await asyncTime();
    return document.querySelector('#submoduleByRouter');
  },
  apps: [
    {
      name: 'vue',
      activeWhen: '/vue',
      // cache: true,
      entry: 'http://localhost:2666',
    },
    {
      name: 'vue2',
      activeWhen: '/vue2',
      // cache: true,
      entry: 'http://localhost:2777',
    },
  ],
  autoRefreshApp: true,
  disablePreloadApp: true,
  protectVariable: ['MonitoringInstance', 'Garfish'],
  sandbox: {
    open: true,
  },

  beforeMount(appInfo) {
    console.log('beforeMount', appInfo);
  },

  afterLoad(info, app) {
    console.log(app.vmSandbox);
  },

  customLoader() {},
};

GarfishInstance.registerApp({
  name: 'react',
  activeWhen: '/react',
  entry: 'http://localhost:2444',
  props: {
    appName: 'react',
  },
});

// The test environment into
if (typeof Cypress !== 'undefined') {
  defaultConfig = {
    ...defaultConfig,
    ...Cypress.env().garfishRunConfig,
  };
}

export const Config = defaultConfig;
