import { createApp } from 'vue';
import App from './App.vue';

let vueInstance;

const providerConfig = {
  render: ({ dom }) => {
    vueInstance = createApp(App);
    vueInstance.mount(dom.querySelector('#app'));
  },
  destroy: ({ dom }) => {
    vueInstance.unmount(dom.querySelector('#app'));
  },
};

// 非微前端环境直接运行
if (!window.__GARFISH__) providerConfig.render({ dom: document });

export const provider = () => providerConfig;
