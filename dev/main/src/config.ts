import GarfishInstance, { interfaces } from 'garfish';

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
      name: 'react',
      activeWhen: '/react',
      // cache: true,
      entry: 'http://localhost:2444',
    },
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
  protectVariable: ['MonitoringInstance'],
  // sandbox: {
  //   snapshot: false
  // },
};

// The test environment into
if (typeof Cypress !== 'undefined') {
  defaultConfig = {
    ...defaultConfig,
    ...Cypress.env().garfishRunConfig,
  };
}

export const Config = defaultConfig;
