import { vueBridge } from '@garfish/bridge-vue-v3';
import { createApp } from 'vue';
import App from './App.vue';

vueBridge({
  rootComponent: App,
  // appOptions: () => ({
  //   el: '#app',
  //   render: () => h(App),
  // }),
});

if (!window.__GARFISH__) {
  // 非微前端环境直接运行
  const vueInstance = createApp(App);
  vueInstance.mount(document.querySelector('#app'));
}
