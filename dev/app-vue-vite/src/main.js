import { vueBridge } from '@garfish/bridge';
import { h, createApp } from 'vue';
import App from './App.vue';

vueBridge({
  createApp,
  appId: 'vite-vue',
  appOptions: () => ({
    el: '#app',
    render() {
      return h(App);
    },
  }),
});

if (!window.__GARFISH__) {
  // 非微前端环境直接运行
  let vueInstance = createApp(App);
  vueInstance.mount(document.querySelector('#app'));
}
