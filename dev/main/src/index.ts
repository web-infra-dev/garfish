/// <reference types="cypress" />

import GarfishInstance from 'garfish';
import { Config } from './config';

GarfishInstance.router.beforeEach((to, from, next) => {
  next();
});
GarfishInstance.run(Config);

let prevApp = null;
const useRouterMode = true;

document.getElementById('vueBtn').onclick = async () => {
  if (useRouterMode) {
    history.pushState({}, 'vue', '/garfish_master/vue'); // use router to load app
  } else {
    if (prevApp) prevApp.unmount();
    prevApp = await GarfishInstance.loadApp('vue', {
      entry: 'http://localhost:2666',
      domGetter: '#submoduleByCunstom',
    });
    console.log(prevApp);
    prevApp && prevApp.mounted ? prevApp.show : await prevApp.mount();
  }
};

document.getElementById('reactBtn').onclick = async () => {
  if (useRouterMode) {
    history.pushState({}, 'react', '/garfish_master/react');
  } else {
    if (prevApp) prevApp.unmount();
    prevApp = await GarfishInstance.loadApp('react', {
      entry: 'http://localhost:2444',
      domGetter: '#submoduleByCunstom',
    });
    console.log(prevApp);
    prevApp && prevApp.mounted ? prevApp.show : await prevApp.mount();
  }
};

document.getElementById('viteBtn').onclick = async () => {
  if (useRouterMode) {
    history.pushState({}, 'vite', '/garfish_master/vite');
  }
};

document.getElementById('esmBtn').onclick = async () => {
  if (useRouterMode) {
    history.pushState({}, 'esmApp', '/garfish_master/esmApp');
  }
};
