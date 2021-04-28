import 'reflect-metadata';
import { Plugin } from './utils/hooks';
import { Garfish } from './instance/context';
import { assert, warn } from '@garfish/utils';
export { Plugin, Lifecycle } from './utils/hooks';
import CjsExternal from '@garfish/cjs-external';

declare global {
  interface Window {
    Garfish: Garfish;
    __GARFISH__: boolean;
  }
}
window.__GARFISH__ = true;

const GarfishInstance = new Garfish({
  plugins: [CjsExternal],
});

async function use() {
  const app = await GarfishInstance.loadApp({
    name: 'vue',
    cache: false,
    entry: 'http://localhost:3000',
    domGetter: '#submoduleByCunstom',
  });
  const vueDom = document.querySelector('#vueBtn');
  vueDom.addEventListener('click', async () => {
    await app.mount();
  });

  const dom = document.querySelector('#reactBtn');
  dom.addEventListener('click', async () => {
    await app.unmount();
  });
}

use();

// GarfishInstance.run();

export default Garfish;
