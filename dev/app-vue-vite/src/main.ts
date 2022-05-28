import { h, createApp } from 'vue';
import { vueBridge } from '@garfish/bridge-vue-v3';
import App from './App.vue';

export const provider = vueBridge({
  rootComponent: App,
  appOptions: () => ({
    el: '#app',
    render: () => h(App),
  }),
});

if (!window.__GARFISH__) {
  // 非微前端环境直接运行
  const vueInstance = createApp(App);
  vueInstance.mount(document.querySelector('#app'));
}
