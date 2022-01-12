import * as Vue from 'vue';
import { h, createApp } from 'vue';
// import * as VueRouter from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router';
import { vueBridge } from '@garfish/bridge';
import App from './App.vue';
import About from './components/About.vue';
import Index from './components/Index.vue';
// import { store } from "./store.js"

const routes = [
  { path: '/about', component: About },
  { path: '/index', component: Index },
];

if (!window.__GARFISH__) {
  const router = createRouter({
    history: createWebHistory('/examples/subapp/vue3'),
    routes,
  });
  const app = createApp(App);
  app.use(router);
  app.mount('#app');
}

// export function provider({ dom, basename }) {
//   let app = null
//   return {
//     render() {
//       app = createApp(App)
//       const router = createRouter({
//         history: createWebHistory(basename),
//         routes,
//       });
//       app.use(router)
//       app.mount(dom? dom.querySelector('#app'): document.querySelector('#app'))
//     },
//     destroy() {
//       if (app) {
//         app.unmount(dom? dom.querySelector('#app'): document.querySelector('#app'))
//       }
//     },
//   };
// }

function newRouter(basename) {
  const router = createRouter({
    history: createWebHistory(basename),
    base: basename,
    routes,
  });
  return router;
}

export const provider = vueBridge({
  Vue,
  rootComponent: App,
  appOptions: ({ appInfo, userProps }) => {
    return {
      el: '#app',
      render: () => h(App, { appInfo, userProps }),
      router: newRouter(appInfo.basename),
    };
  },
});
