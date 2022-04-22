import { h, createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { stateSymbol, createState } from './store.js';
import App from './App.vue';
import ToDoList from './components/todo.vue';
import HelloGarfish from './components/HelloGarfish.vue';
import { vueBridge } from '@garfish/bridge';

const routes = [
  { path: '/home', component: HelloGarfish },
  { path: '/toDoList', component: ToDoList },
];

function newRouter(basename) {
  const router = createRouter({
    history: createWebHistory(basename),
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
