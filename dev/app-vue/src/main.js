import Vue from 'vue';
import App from './App.vue';
import store from './store';
import VueRouter from 'vue-router';
import HelloWorld from './components/HelloWorld.vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import { vueBridge } from '@garfish/bridge';

Vue.use(ElementUI);
Vue.use(VueRouter);
Vue.config.productionTip = false;

function newRouter(basename) {
  const router = new VueRouter({
    mode: 'history',
    base: basename,
    routes: [{ path: '/', component: HelloWorld }],
  });
  return router;
}

export const provider = vueBridge({
  Vue,
  rootComponent: App,
  appOptions: ({ basename }) => ({
    el: '#app',
    router: newRouter(basename),
    store,
  }),
});

if (!window.__GARFISH__) {
  console.log('hello world');
  const router = newRouter('/');
  new Vue({
    store,
    router,
    render: (h) => h(App),
  }).$mount('#app');
}

// let vm;
// const render = ({ dom, basename = '/' }) => {
//   const router = new VueRouter({
//     mode: 'history',
//     base: basename,
//     router,
//     routes: [
//       { path: '/', component: HelloWorld },
//       { path: '/test', component: Test },
//       { path: '/todo', component: ToDoList },
//     ],
//   });

//   vm = new Vue({
//     store,
//     render: (h) => h(App, { props: { basename } }),
//   }).$mount();
//   (dom || document).querySelector('#app').appendChild(vm.$el);
// };

// if (!window.__GARFISH__) {
//   render({
//     dom: document,
//   });
// } else {
//   // eslint-disable-next-line no-undef
//   __GARFISH_EXPORTS__.provider = provider;
// }

// export function provider({ basename, dom, fuckYou }) {
//   console.log('provider', basename, dom, fuckYou);
//   return {
//     render: () => render({ basename, dom }),
//     destroy() {
//       vm.$destroy();
//       vm.$el.parentNode && vm.$el.parentNode.removeChild(vm.$el);
//     },
//   };
// }

// let a = document.body;
// let ob = new MutationObserver(() => {
//   console.log('变动');
// });
// ob.observe(document, { attributes: true });
// console.log(a);

// setTimeout(() => {
//   let dom = document.querySelector('#app');
//   let before = dom.querySelector('#app');
//   let style1 = document.createElement('style');
//   style1.setAttribute('id', 'style1');
//   dom.insertBefore(style1, before);
// }, 1000);

// console.log('Node', Node);
// var d = document.createElement('div');
// console.log(d instanceof Text, 'Text');

// var b;
// window.a = b = function b() {};
// console.log(window.a === b, 111);

// setTimeout(() => {
//   // throw new Error('vue app error');
// }, 3000);

// console.log(document.currentScript);
