import { defineConfig, PluginOption } from 'vite';
import vue from '@vitejs/plugin-vue';
import { htmlPlugin } from '@garfish/vite-plugin';
import config from '../config.json';

let portInfo = config['dev/vite-plugin'];

// https://vitejs.dev/config/
export default defineConfig({
  base: `http://localhost:${portInfo.port}/`,
  server: {
    port: portInfo.port,
    cors: true,
    origin: `http://localhost:${portInfo.port}`,
  },
  plugins: [
    vue(),
    htmlPlugin('vite-vue-sub-app', {
      useDevMode: true,
    }),
  ],
});
