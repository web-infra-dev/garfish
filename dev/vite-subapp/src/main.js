import { vueBridge } from '@garfish/bridge';
import { h, createApp } from 'vue';
import App from './App.vue';

export const provider = vueBridge({
  createApp,
  appId: 'vite-vue-sub-app',
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
} else if (import.meta.env.PROD) {
  // 生产环境则不是 esm 环境了
  (__GARFISH_EXPORTS__ || exports).provider = provider;
}
