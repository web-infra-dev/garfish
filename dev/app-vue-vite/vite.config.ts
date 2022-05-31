import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import portMap from '../config.json';

const appName = 'dev/vite';
const port = portMap[appName].port;

export default ({ mode }) => {
  process.env = {
    ...process.env,
    ...loadEnv(mode, process.cwd()),
  };

  return defineConfig({
    base: `http://localhost:${port}`,
    server: {
      port,
      cors: true,
      origin: `http://localhost:${port}`,
    },
    plugins: [vue()],
  });
};
