import Vue from 'vue';
import App from './App.vue';
import store from './store';
import VueRouter from 'vue-router';
import ToDoList from './components/todo.vue';
import HelloWorld from './components/HelloWorld.vue';
import Test from './components/test.vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import GarfishInstance from '@garfish/core';

Vue.use(ElementUI);
Vue.use(VueRouter);
Vue.config.productionTip = false;

let vm;
const render = ({ dom, basename = '/' }) => {
  const router = new VueRouter({
    mode: 'history',
    base: basename,
    router,
    routes: [
      { path: '/', component: HelloWorld },
      { path: '/todo', component: ToDoList },
      { path: '/test', component: Test },
    ],
  });

  vm = new Vue({
    store,
    router,
    render: (h) => h(App),
  }).$mount();
  (dom || document).querySelector('#app').appendChild(vm.$el);
};

if (!window.__GARFISH__) {
  render({});
} else {
}

export function provider({ basename, dom }) {
  return {
    render: () => render({ basename, dom }),
    destroy() {
      vm.$destroy();
      vm.$el.parentNode && vm.$el.parentNode.removeChild(vm.$el);
    },
  };
}
