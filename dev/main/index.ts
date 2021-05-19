import Garfish from '@garfish/core';

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
  sandbox: {
    open: true,
    snapshot: false,
  },
  plugins: [],
});

// window.Garfish = GarfishInstance;
console.log(GarfishInstance);

GarfishInstance.run();

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
  // if (useRouterMode) {
  //   history.pushState({}, 'react', '/garfish_master/react');
  // } else {
  //   let prevApp = await GarfishInstance.loadApp('react', {
  //     entry: '',
  //     domGetter: '#submoduleByCunstom',
  //   });
  // }
};

setTimeout(() => {
  throw new Error('main error');
}, 3000);
