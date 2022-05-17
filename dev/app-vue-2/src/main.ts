import Vue from 'vue';
import VueRouter from 'vue-router';
import ElementUI from 'element-ui';
import store from './store';
import App from './App.vue';
import TaskComponent from './components/Tasks.vue';
import TodoListComponent from './components/todo.vue';
import HelloGarfish from './components/HelloGarfish.vue';
import RemoteComponent from './components/remoteComponent.vue';
import 'element-ui/lib/theme-chalk/index.css';
import { vueBridge } from '@garfish/bridge-vue-v2';

const MicroApp = import('./components/microApp.vue');

Vue.use(ElementUI);
Vue.use(VueRouter);
Vue.config.productionTip = false;

function newRouter(basename) {
  const router = new VueRouter({
    mode: 'history',
    base: basename,
    routes: [
      { path: '/home', component: HelloGarfish },
      { path: '/tasks', component: TaskComponent },
      { path: '/toDoList', component: TodoListComponent },
      { path: '/micro-*', component: () => MicroApp },
      { path: '/remote-component', component: RemoteComponent },
    ],
  });
  return router;
}

export const provider = vueBridge({
  rootComponent: App,
  loadRootComponent: ({ basename, dom, appName, props }) => {
    console.log({ basename, dom, appName, props });
    store.dispatch('setBasename', basename);
    store.dispatch('setProps', props);
    return Promise.resolve(App);
  },
  handleInstance: (vueInstance, { basename, dom, appName, props }) => {
    console.log(vueInstance, basename, dom, appName, props);
  },

  appOptions: ({ basename, dom, appName, props }) => {
    console.log({ basename, dom, appName, props });
    return {
      el: '#app',
      router: newRouter(basename),
      store,
    };
  },
});

// There is no running show that the main application execution run, you can perform in micro front-end environment rendering
if (!window.__GARFISH__) {
  const router = newRouter('/');
  new Vue({
    router,
    render: (h) => h(App),
    store,
  }).$mount('#app');
}
