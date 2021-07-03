import { cacheModules } from './common';
import { GarfishRemoteModulePlugin } from './garfishPlugin';
import { preload } from './apis/preload';
import { esModule } from './apis/esModule';
import { loadModule } from './apis/loadModule';
import { loadModuleSync } from './apis/loadModuleSync';
import { setModuleAlias } from './apis/setModuleAlias';
import { setModuleExternal } from './apis/setModuleExternal';

// Remote module loader uses singleton mode
const loader = {
  preload,
  esModule,
  loadModule,
  loadModuleSync,
  setModuleAlias,
  setModuleExternal,
  cacheModules,
};

export {
  preload,
  esModule,
  loadModule,
  loadModuleSync,
  setModuleAlias,
  setModuleExternal,
  cacheModules,
  GarfishRemoteModulePlugin,
  loader as default,
};
