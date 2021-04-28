import 'reflect-metadata';
import { Garfish } from './instance/context';
import { assert, warn } from '@garfish/utils';
export { Plugin, Lifecycle } from './plugin/hooks';
import CjsExternal from '@garfish/cjs-external';
import { container, TYPES } from './ioc/container';
import { Hooks } from './plugin/hooks';
import Hook from 'packages/runtime/hooks/src/Hook';
import { Loader } from './module/loader';

container.bind<Garfish>(TYPES.Garfish).toConstructor(Garfish);
container.bind<Hooks>(TYPES.Hooks).to(Hooks);
container.bind<Loader>(TYPES.Loader).to(Loader);

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

console.log(GarfishInstance);
// GarfishInstance.run();

export default Garfish;
