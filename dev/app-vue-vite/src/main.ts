import { vueBridge } from '@garfish/bridge';
import { h, createApp } from 'vue';
import App from './App.vue';

vueBridge({
  createApp,
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
