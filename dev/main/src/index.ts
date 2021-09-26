/// <reference types="cypress" />
import GarfishInstance from 'garfish';
import { Config } from './config';

GarfishInstance.run(Config);

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
    prevApp && (await prevApp.mount());
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
    prevApp && (await prevApp.mount());
  }
};

// Plugin test
const hooks = GarfishInstance.createPluginSystem(({ SyncHook, AsyncHook }) => {
  return {
    create: new AsyncHook<[number], string>(),
  };
});

// hooks.usePlugin({
//   name: 'test',
//   create(a) {
//     console.log(a);
//     return '';
//   },
// });

hooks.lifecycle.create.emit(123);
