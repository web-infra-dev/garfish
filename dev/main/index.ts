/// <reference types="cypress" />
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
  sandbox: {
    snapshot: false,
    modules: [],
  },
};
// The test environment into
if (typeof Cypress !== 'undefined') {
  defaultConfig = {
    ...defaultConfig,
    ...Cypress.env().garfishRunConfig,
  };
}

GarfishInstance.run(defaultConfig);

const useRouterMode = true;

document.getElementById('vueBtn').onclick = async () => {
  if (useRouterMode) {
    history.pushState({}, 'vue', '/garfish_master/vue'); // use router to load app
  } else {
    let prevApp = await GarfishInstance.loadApp('vue', {
      entry: 'http://localhost:9090',
      domGetter: '#submoduleByCunstom',
    });
    console.log(prevApp);
    await prevApp.mount();
  }
};

document.getElementById('reactBtn').onclick = async () => {
  if (useRouterMode) {
    history.pushState({}, 'react', '/garfish_master/react');
  } else {
    let prevApp = await GarfishInstance.loadApp('react', {
      entry: 'http://localhost:3000',
      domGetter: '#submoduleByCunstom',
    });
    console.log(prevApp);
    await prevApp.mount();
  }
};
