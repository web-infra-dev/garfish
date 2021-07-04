import { cacheModules } from './common';
import { GarfishRemoteModulePlugin } from './garfishPlugin';
import { preload } from './apis/preload';
import { esModule } from './apis/esModule';
import { loadModule } from './apis/loadModule';
import { loadModuleSync } from './apis/loadModuleSync';
import { setModuleInfo } from './apis/setModuleInfo';

// Remote module loader uses singleton mode
const loader = {
  preload,
  esModule,
  loadModule,
  loadModuleSync,
  setModuleInfo,
  cacheModules,
};

export {
  preload,
  esModule,
  loadModule,
  loadModuleSync,
  setModuleInfo,
  cacheModules,
  GarfishRemoteModulePlugin,
  loader as default,
};
