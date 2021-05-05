import { Garfish } from './instance/context';
import CjsExternal from '@garfish/cjs-external';
import BrowserVm from '@garfish/browser-vm';

window.__GARFISH__ = true;

const GarfishInstance = new Garfish({
  plugins: [CjsExternal, BrowserVm],
});

window.Garfish = GarfishInstance;

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

console.log(GarfishInstance);

export default Garfish;

export { interfaces } from './interface';
