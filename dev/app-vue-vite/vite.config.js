import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { getPort } from '../util'
const appName = 'dev/vite';

export default ({ mode }) => {
  process.env = {
    ...process.env,
    ...loadEnv(mode, process.cwd()),
  };

  return defineConfig({
    base: `http://localhost:${getPort(appName)}`,
    server: {
      port: getPort(appName),
      cors: true,
      origin: Boolean(process.env.IDE_PLATFORM)
            ? `https://${getPort(appName)}-ssh2m4h1iyv4pprod.webide-boe.byted.org`
            : `http://localhost:${getPort(appName)}`,
    },
    plugins: [
      vue(),
    ],
  });
};
