import VueRouter from 'vue-router';
import Garfish from '@garfish/core';
import GarfishCjsApp from '@garfish/cjs-app';
import GarfishRouter from '@garfish/router';
import GarfishVm from '@garfish/browser-vm';

let GarfishInstance = new Garfish({
  basename: '/gar_master',
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
  plugins: [GarfishCjsApp(), GarfishRouter(), GarfishVm()],
});

window.Garfish = GarfishInstance;

GarfishInstance.run({});

let useRouterMode = true;
document.getElementById('vueBtn').onclick = async () => {
  if (useRouterMode) {
    history.pushState({}, 'vue', '/gar_master/vue'); // 通过路由的方式加载
  } else {
    let prevApp = await GarfishInstance.loadApp('vue', {
      entry: 'http://localhost:3000',
      domGetter: '#submoduleByCunstom',
    }); // 或者手动加载
    console.log(prevApp);
    await prevApp.mount();
  }
};

document.getElementById('reactBtn').onclick = async () => {
  if (useRouterMode) {
    history.pushState({}, 'react', '/gar_master/react');
  } else {
    let prevApp = await GarfishInstance.loadApp('react', {
      entry: '',
      domGetter: '#submoduleByCunstom',
    });
  }
};

// import store from './store';
// import { observable, autorun } from 'mobx';
// // Gar.setExternal('vue-router', VueRouter);
// Gar.router.beforeEach((to, from, next) => {
//   next();
// });

// Gar.router.afterEach((to, from, next) => {
//   next();
// });

// function iframeMountActive(appInfo) {
//   const iframe = document.createElement('iframe');
//   iframe.src = appInfo.entry + location.search;
//   iframe.setAttribute('style', 'width: 100%;height: 100%;border: none;');
//   document.querySelector('#submoduleByRouter').appendChild(iframe);
//   appInfo.iframe = iframe;
// }

// function iframeDeactive(appInfo) {
//   appInfo.iframe.parentNode.removeChild(appInfo.iframe);
//   delete appInfo.iframe;
// }

// Gar.router.routerChange((path, query) => {
//   Gar.options.apps.forEach((app) => {
//     if (app.iframe) {
//       app.iframe.src = 'http://sss.com';
//       app.iframe.contentWindow.postMessage(
//         {
//           type: 'router-change',
//           info: path + location.search,
//         },
//         '*',
//       );
//     }
//   });
// });

// (Gar.loader.requestConfig = () => ({
//   headers: {
//     Referer: 'http://localhost:2334',
//     'x-tt': '111',
//   },
// })),
//   Gar.run({
//     sandbox: {
//       open: true,
//       snapshot: false,
//       strictIsolation: false,
//     },
//     basename: '/gar_master',
//     domGetter: '#submoduleByRouter',
//     disableStatistics: true,
//     protectVariable: ['chen'],
//     props: {
//       store: {
//         // userInfo: store.getters.userInfo,
//         // changeInfo: (info) => {
//         //   store.dispatch('increment', info);
//         // },
//         // watchInfo: (fn) =>
//         //   store.watch((state) => state.userInfo, fn, { deep: true }),
//         // userInfo: store.userInfo,
//         // watchInfo: (fn)=> autorun(fn)
//       },
//     },
//     apps: [
//       {
//         name: 'react',
//         activeWhen: '/react',
//         // cache: true,
//         entry: 'http://localhost:3000',
//         props: {
//           a: 1,
//         },
//       },
//       {
//         name: 'vue',
//         activeWhen: '/vue',
//         cache: true,
//         entry: 'http://localhost:9090',
//       },
//       // {
//       //   name: 'iframe',
//       //   activeWhen: '/iframe',
//       //   entry: 'http://baidu.com',
//       //   // active: iframeMountActive,
//       //   // deactive: iframeDeactive,
//       // },
//     ],

//     // beforeUnmount() {
//     //   return new Promise((resolve) => {
//     //     setTimeout(resolve, 500);
//     //   });
//     // },

//     // beforeMount() {
//     //   return new Promise((resolve) => {
//     //     setTimeout(resolve, 500);
//     //   });
//     // },

//     beforeLoad(appPath) {
//       // return new Promise((resolve) => {
//       //   console.log('模拟等待数据请求，3s 后加载');
//       //   setTimeout(() => {
//       //     // resolve(false);
//       //     resolve(true);
//       //   }, 3000);
//       // });
//     },

//     activate(provider, appPath) {
//       console.log('activate');
//     },

//     deactivate(appPath) {
//       console.log('deactivate');
//     },
//     errorLoadApp(e, info) {
//       console.log('main', e, info);
//     },
//   });

// let prevApp = null;
// const useRun = false; // 使用 app.run
// const useRouterMode = true; // 使用路由模式

// const loadApp = async (name) => {
//   prevApp && prevApp();
//   const run = async (opts) => {
//     if (useRun) {
//       const app = await Gar.loadApp(name);
//       const { mount, unmount } = await app.run(opts);
//       return { app, mount, unmount };
//     } else {
//       const app = await Gar.loadApp(name, opts);
//       return {
//         app,
//         mount: () => app.mount(),
//         unmount: () => app.unmount(),
//       };
//     }
//   };

//   const { app, mount, unmount } = await run({
//     cache: true,
//     domGetter: () => document.getElementById('submoduleByCunstom'),
//     errorLoadApp(e, info) {
//       console.log(e, info);
//     },
//     sandbox: {
//       snapshot: false,
//       useStrict: false,
//       modules: {
//         customModules: () => ({
//           override: {
//             HTMLElement,
//           },
//         }),
//       },
//     },
//   });

//   window.app = app;
//   await mount();
//   return () => unmount();
// };

// document.getElementById('vueBtn').onclick = async () => {
//   if (useRouterMode) {
//     history.pushState({}, 'vue', '/vue'); // 通过路由的方式加载
//   } else {
//     prevApp = await loadApp('vue'); // 或者手动加载
//   }
// };

// document.getElementById('reactBtn').onclick = async () => {
//   if (useRouterMode) {
//     history.pushState({}, 'react', '/react');
//   } else {
//     prevApp = await loadApp('react');
//   }
// };
