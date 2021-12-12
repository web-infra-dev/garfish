import { defineConfig, PluginOption } from 'vite';
import vue from '@vitejs/plugin-vue';
import { htmlPlugin } from '@garfish/vite-plugin';

// https://vitejs.dev/config/
export default defineConfig({
  base: 'http://localhost:3000/',
  server: {
    port: 3000,
    cors: true,
    origin: 'http://localhost:3000',
  },
  plugins: [
    vue(),
    htmlPlugin('vite-vue-sub-app', {
      useDevMode: true,
    }),
  ],
});
