import { cacheModules } from './common';
import { GarfishRemoteModulePlugin } from './garfishPlugin';
import { preload } from './apis/preload';
import { esModule } from './apis/esModule';
import { loadModule } from './apis/loadModule';
import { setExternal } from './apis/setExternal';
import { loadModuleSync } from './apis/loadModuleSync';

// Remote module loader uses singleton mode
const loader = {
  preload,
  esModule,
  setExternal,
  loadModule,
  loadModuleSync,
  cacheModules,
};

export {
  preload,
  esModule,
  setExternal,
  loadModule,
  loadModuleSync,
  GarfishRemoteModulePlugin,
  cacheModules,
  loader as default,
};
