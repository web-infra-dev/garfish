/// <reference types="cypress" />
import GarfishInstance, { interfaces } from 'garfish';
import { Config } from './config';

GarfishInstance.run(Config);

const useRouterMode = true;

GarfishInstance.registerApp({
  name: 'hello',
  entry: 'http://baidu.com',
});

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
