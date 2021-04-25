import { Plugin } from './utils/hooks';
import { Garfish } from './instance/context';
import { assert, warn } from '@garfish/utils/src';
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
  plugins: [CjsExternal]
});


async function use () {
  let app = await GarfishInstance.loadApp({
    name: 'vue',
    cache: false,
    entry: 'http://localhost:3000' ,
    domGetter: '#submoduleByCunstom'
  })
  console.log(await app.mount());

  // setTimeout(()=>{
  //   app.unmount();
  // },4000)
}

use();

GarfishInstance.run();

export default Garfish;
