import { vueBridge } from '@garfish/bridge';
import { h, createApp } from 'vue';
import App from './App.vue';

export const provider = vueBridge({
  createApp,
  appId: 'vite-vue',
  appOptions: () => ({
    el: '#app',
    render() {
      return h(App);
    },
  }),
});

// 非微前端环境直接运行
if (!window.__GARFISH__) {
  let vueInstance = createApp(App);
  vueInstance.mount(document.querySelector('#app'));
}
