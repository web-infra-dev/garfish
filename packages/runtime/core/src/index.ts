import { Garfish } from './instance/context';
import CjsAppPlugin from '@garfish/cjs-app';
import BrowserVmPlugin from '@garfish/browser-vm';
import RouterPlugin from '@garfish/router';

const GarfishInstance = new Garfish({
  basename: '/',
  apps: [
    {
      name: 'vue',
      cache: false,
      activeWhen: '/vue',
      entry: 'http://localhost:3000',
    },
  ],
  domGetter: '#submoduleByCunstom',
  plugins: [CjsAppPlugin(), BrowserVmPlugin(), RouterPlugin()],
});

window.__GARFISH__ = true;
window.Garfish = GarfishInstance;
GarfishInstance.run();

async function use() {
  // const app = await GarfishInstance.loadApp({
  //   name: 'vue',
  //   cache: false,
  //   activeWhen: '/vue',
  //   entry: 'http://localhost:3000',
  //   domGetter: '#submoduleByCunstom',
  // });

  const vueDom = document.querySelector('#vueBtn');
  vueDom.addEventListener('click', async () => {
    // await app.mount();
    history.pushState({}, null, '/vue');
  });

  const dom = document.querySelector('#reactBtn');
  dom.addEventListener('click', async () => {
    // await app.unmount();
  });
}

use();
console.log(GarfishInstance);

export default Garfish;

export { interfaces } from './interface';
