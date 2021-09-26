import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App.vue';
import About from './components/About.vue';
import Index from './components/Index.vue';

Vue.config.productionTip = false;
Vue.use(VueRouter);

const render = function ({ basename, dom }) {
  const router = new VueRouter({
    mode: 'history',
    base: basename,
    routes: [
      { path: '/', component: Index },
      { path: '/about', component: About },
    ],
  });

  vm = new Vue({
    router,
    render: (h) => h(App),
  }).$mount();
  dom.appendChild(vm.$el);
};

if (!window.__GARFISH__) {
  render({ basename: '/vu2', dom: document.querySelector('#app') });
}

let vm;
export function provider({ dom, basename }) {
  return {
    render: () => render({ dom, basename }),
    destroy: () => {
      vm.$destroy();
      vm.$el.parentNode && vm.$el.parentNode.removeChild(vm.$el);
    },
  };
}
