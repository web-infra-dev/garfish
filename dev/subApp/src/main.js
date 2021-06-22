import Garfish from 'garfish';
import Vue from 'vue';
import App from './App.vue';
import store from './store';
import VueRouter from 'vue-router';
import ToDoList from './components/todo.vue';
import HelloWorld from './components/HelloWorld.vue';
import Test from './components/test.vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

// setTimeout(() => {
//   let cur = document.querySelector('#app');
//   console.log('^^^^^^^^^^^^^', cur, document);
//   while (cur !== document && cur) {
//     cur = cur && cur.parentNode;
//     console.log(cur);
//   }
// }, 3000);

// // window.chen = 1212;
// // window.tao = 2;
// // console.log(VueRouter === window.Gar.externals['vue-router']);
// window.a = function a() {
//   console.log('a');
// };
// const fn = window.a;
// window.a.tt = 1;
// console.log(window.a.tt, 'tttt');
// console.log(window.a === fn);

// Object.defineProperty(window, 'chen', { value: 1212 });
// Object.defineProperty(window, 'tao', { value: 2 });
// console.log('chen', window.chen, window.tao);
// // delete window.chen;
// Object.defineProperty(document, 'cookie', { value: 121, configurable: true });

// console.log(window.chen);
// console.log(document.currentScript);
// console.dir(Symbol);
Vue.use(ElementUI);
Vue.use(VueRouter);
// 查看父应用注入的 external 模块
Vue.config.productionTip = false;

// 这会一直加载 vue
// setTimeout(() => {
//   window.Garfish.loadApp('vue', {
//     domGetter: '#vueApp',
//   }).then(app => app.mount())
// }, 1000)

// const audio = new Audio();
// console.log(audio instanceof Audio);
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
    render: (h) => h(App, { props: { basename } }),
  }).$mount();
  (dom || document).querySelector('#app').appendChild(vm.$el);
  // console.log('#######', dom.querySelector('#app'));
  // document.addEventListener('resize', () => console.log(1));
  // window.addEventListener('resize', () => console.log(2));
};

// console.log(document.body.contains(document.querySelector('#app')));

// 没有运行表明，没有主应用执行 run，可以执行不在微前端环境下的渲染
if (!window.__GARFISH_PARENT__) {
  render({});
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

// let a = document.body;
// let ob = new MutationObserver(() => {
//   console.log('变动');
// });
// ob.observe(document, { attributes: true });
// console.log(a);

// setTimeout(() => {
//   // let dom = document.querySelector('#app');
//   // let before = dom.querySelector('#app');
//   // let style1 = document.createElement('style');
//   // style1.setAttribute('id', 'style1');
//   // dom.insertBefore(style1, before);
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
