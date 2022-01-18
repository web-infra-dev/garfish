import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import config from '../config.json';

const portInfo = config['dev/vite-subapp'];

// https://vitejs.dev/config/
export default defineConfig({
  base: `http://localhost:${portInfo.port}/`,
  server: {
    port: portInfo.port,
    cors: true,
    origin: `http://localhost:${portInfo.port}`,
  },
  plugins: [vue()],
});
