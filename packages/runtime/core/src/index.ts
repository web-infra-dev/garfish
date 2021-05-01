import 'reflect-metadata';
import { Garfish } from './instance/context';
import { assert, warn } from '@garfish/utils';
export { Plugin } from './plugin/hooks';
import CjsExternal from '@garfish/cjs-external';
import { container, TYPES } from './ioc/container';
import { Hooks } from './plugin/hooks';
import { Loader } from './module/loader';
import { interfaces } from './interface/index';

container.bind<Hooks>(TYPES.Hooks).to(Hooks).inRequestScope();
container.bind<Loader>(TYPES.Loader).to(Loader).inRequestScope();

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
window.Garfish = GarfishInstance;

use();

console.log(GarfishInstance);

export default Garfish;
