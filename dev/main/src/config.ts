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
      cache: false,
      entry: 'http://localhost:2666',
    },
    {
      name: 'vue2',
      cache: false,
      activeWhen: '/vue2',
      entry: 'http://localhost:2777',
    },
    // {
    //   name: 'react',
    //   activeWhen: '/react',
    //   entry: 'http://localhost:2444',
    //   props: {
    //     appName: 'react',
    //   },
    // },
  ],
  autoRefreshApp: false,
  disablePreloadApp: true,
  protectVariable: ['MonitoringInstance', 'Garfish'],
  sandbox: {
    open: true,
    strictIsolation: true,
  },

  // beforeMount(appInfo) {
  //   console.log('beforeMount', appInfo);
  // },

  // afterLoad(info, app) {
  //   console.log(app.vmSandbox);
  // },

  customLoader() {},
};

// setTimeout(()=>{
GarfishInstance.registerApp({
  name: 'react',
  activeWhen: '/react',
  cache: false,
  // basename: '/garfish_master',
  entry: 'http://localhost:2444',
  // domGetter: ()=>document.querySelector('#submoduleByRouter'),
  props: {
    appName: 'react',
  },
});
// })

// The test environment into
if (typeof Cypress !== 'undefined') {
  defaultConfig = {
    ...defaultConfig,
    ...Cypress.env().garfishRunConfig,
  };
}

export const Config = defaultConfig;
