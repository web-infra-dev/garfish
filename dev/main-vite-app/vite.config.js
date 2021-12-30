import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import config from '../config.json';

let portInfo = config['dev/main'];

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: portInfo.port,
    cors: true,
    origin: `http://localhost:${portInfo.port}`,
  },
});
