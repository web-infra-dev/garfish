import Garfish from '@garfish/core';
// import GarfishCjsApp from '@garfish/cjs-app';
// import GarfishRouter from '@garfish/router';
// import GarfishVm from '@garfish/browser-vm';
// import GarfishSnapshot from '@garfish/browser-snapshot';

let GarfishInstance = new Garfish({
  basename: '/garfish_master',
  domGetter: '#submoduleByRouter',
  apps: [
    {
      name: 'react',
      activeWhen: '/react',
      entry: 'http://localhost:3000',
      props: {
        a: 1,
      },
    },
    {
      name: 'vue',
      activeWhen: '/vue',
      cache: true,
      entry: 'http://localhost:9090',
    },
  ],
  plugins: [
    // GarfishCjsApp(),
    // GarfishRouter(),
    // GarfishSnapshot(),
    // GarfishVm(),
  ],
});

// window.Garfish = GarfishInstance;

GarfishInstance.run({});

let useRouterMode = true;
document.getElementById('vueBtn').onclick = async () => {
  if (useRouterMode) {
    history.pushState({}, 'vue', '/garfish_master/vue'); // use router to load app
  } else {
    let prevApp = await GarfishInstance.loadApp('vue', {
      entry: 'http://localhost:3000',
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
      entry: '',
      domGetter: '#submoduleByCunstom',
    });
  }
};
