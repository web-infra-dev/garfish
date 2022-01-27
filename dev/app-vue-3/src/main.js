// import * as Vue from 'vue';
import { h, createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { stateSymbol, createState } from './store.js';
import App from './App.vue';
import Test from './components/test.vue';
import ToDoList from './components/todo.vue';
// import MicroApp from './components/microApp.vue';
import HelloGarfish from './components/HelloGarfish.vue';
import RemoteComponent from './components/remoteComponent.vue';
import { vueBridge } from '@garfish/bridge';
// import store from "./store"

const routes = [
  { path: '/home', component: HelloGarfish },
  { path: '/test', component: Test },
  { path: '/todo', component: ToDoList },
  // { path: '/micro-*', component: MicroApp },
  { path: '/remote-component', component: RemoteComponent },
];

function newRouter(basename) {
  const router = createRouter({
    history: createWebHistory(basename),
    base: basename,
    routes,
  });
  return router;
}

// There is no running show that the main application execution run, you can perform in micro front-end environment rendering
if (!window.__GARFISH__) {
  const router = newRouter('/');
  const app = createApp(App);
  app.provide(stateSymbol, createState());
  app.use(router);
  app.mount('#app');
}

export const provider = vueBridge({
  createApp,
  appId: 'vue',
  rootComponent: App,
  loadRootComponent: ({ basename, dom, appName, props }) => {
    console.log(basename, dom, appName, props);
    return Promise.resolve(App);
  },
  appOptions: ({ basename, dom, appName, props }) => {
    console.log(basename, dom, appName, props);
    return {
      el: '#app',
      render: () => h(App),
      router: newRouter(basename),
    };
  },
  handleInstance: (vueInstance, { basename, dom, appName, props }) => {
    console.log(basename, dom, appName, props);
    vueInstance.use(newRouter(basename));
    vueInstance.provide(stateSymbol, createState());
  },
});

// export function provider({ dom, basename }) {
//   let app = null;
//   return {
//     render() {
//       app = createApp(App);
//       app.provide(stateSymbol, createState());
//       const router = createRouter({
//         history: createWebHistory(basename),
//         routes,
//       });
//       app.use(router);
//       app.mount(
//         dom ? dom.querySelector('#app') : document.querySelector('#app'),
//       );
//     },
//     destroy() {
//       if (app) {
//         app.unmount(
//           dom ? dom.querySelector('#app') : document.querySelector('#app'),
//         );
//       }
//     },
//   };
// }
