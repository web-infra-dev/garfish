import Vue from 'vue';
import VueRouter from 'vue-router';
import ElementUI from 'element-ui';
import store from './store';
import App from './App.vue';
import Test from './components/test.vue';
import ToDoList from './components/todo.vue';
import MicroApp from './components/microApp.vue';
import HelloGarfish from './components/HelloGarfish.vue';
import RemoteComponent from './components/remoteComponent.vue';
import 'element-ui/lib/theme-chalk/index.css';
import { vueBridge } from '@garfish/bridge';

Vue.use(ElementUI);
Vue.use(VueRouter);
Vue.config.productionTip = false;

function newRouter(basename) {
  const router = new VueRouter({
    mode: 'history',
    base: basename,
    router,
    routes: [
      { path: '/', component: HelloGarfish },
      { path: '/test', component: Test },
      { path: '/todo', component: ToDoList },
      { path: '/micro-*', component: MicroApp },
      { path: '/remote-component', component: RemoteComponent },
    ],
  });
  return router;
}

export const provider = vueBridge({
  Vue,
  rootComponent: App,
  appOptions: ({ basename }) => {
    const router = newRouter(basename);
    return {
      el: '#app',
      router,
      store,
    };
  },
});

// There is no running show that the main application execution run, you can perform in micro front-end environment rendering
if (!window.__GARFISH__) {
  const router = newRouter('/');
  new Vue({
    store,
    router,
    render: (h) => h(App),
  }).$mount();
}
