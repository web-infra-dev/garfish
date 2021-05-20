import { Garfish } from './garfish';
import GarfishRouter from '@garfish/router';
import GarfishCjsExternal from '@garfish/cjs-external';
import GarfishHMRPlugin from './plugins/fixHMR';
import GarfishOptionsLife from './plugins/lifecycle';

const GarfishInstance = new Garfish({
  plugins: [
    GarfishCjsExternal(),
    GarfishRouter(),
    GarfishHMRPlugin(),
    GarfishOptionsLife(),
  ],
});

window.Garfish = GarfishInstance;
window.__GARFISH__ = true;

export { interfaces } from './interface';
export { Garfish } from './garfish';
export default GarfishInstance;
