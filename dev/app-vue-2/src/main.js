import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App.vue';
import About from './components/About.vue';
import Index from './components/Index.vue';
import { vueBridge } from '@garfish/bridge';

Vue.config.productionTip = false;
Vue.use(VueRouter);

const routes = [
  { path: '/about', component: About },
  { path: '/home', component: Index },
];

if (!window.__GARFISH__) {
  const router = new VueRouter({
    mode: 'history',
    routes,
    base: '/examples/subapp/vue2',
  });

  new Vue({
    router,
    render: (h) => h(App),
  }).$mount('#app');
}

function newRouter(basename) {
  console.log('==basename', basename);
  const router = new VueRouter({
    mode: 'history',
    routes,
    base: basename,
  });
  return router;
}

// let vm;
// 子应用提供 provider 函数:
// export function provider({ dom, basename }) {
//   return {
//     render() {
//       vm = new Vue({
//         router: newRouter(basename),
//         render: (h) => h(App),
//       }).$mount();
//       dom.appendChild(vm.$el);
//     },
//     destroy() {
//       vm.$destroy();
//       vm.$el.parentNode && vm.$el.parentNode.removeChild(vm.$el);
//     },
//   };
// }

// 使用 vueBridge 函数:
export const provider = vueBridge({
  Vue,
  rootComponent: App,
  loadRootComponent: ({ basename, dom, appName, props }) => {
    console.log(basename, dom, appName, props);
    return Promise.resolve(App);
  },

  appOptions: ({ basename, dom, appName, props }) => {
    console.log(basename, dom, appName, props);
    return {
      el: '#app',
      router: newRouter(basename),
    };
  },
  handleInstance: (vueInstance, { basename, dom, appName, props }) => {
    console.log(basename, dom, appName, props);
    // vueInstance.use(newRouter(basename))
  },
});
