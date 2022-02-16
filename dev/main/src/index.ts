/// <reference types="cypress" />

import GarfishInstance from 'garfish';
import { AsyncWaterfallHook } from '@garfish/hooks';
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

// Plugin test
const hooks = GarfishInstance.createPluginSystem(({ SyncHook, AsyncHook }) => {
  return {
    create: new AsyncHook<[number]>(),
  };
});

hooks.usePlugin({
  name: 'test',
  create(a) {
    console.log(a);
  },
});

hooks.lifecycle.create.emit(123);

async function f() {
  const hook = new AsyncWaterfallHook<{ name: string }>('test');

  // @ts-ignore
  hook.on(async () => {
    return '';
  });
  hook.on(async (data) => {
    data.name += '2';
    return data;
  });

  const obj = { fn() {} };
  hook.onerror = obj.fn;

  const data = await hook.emit({ name: 'chen' });
}
f();
