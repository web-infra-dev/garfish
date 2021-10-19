import { hooks } from './hooks';
import { loader, cacheModules } from './common';
import { preload } from './apis/preload';
import { esModule } from './apis/esModule';
import { loadModule } from './apis/loadModule';
import { loadModuleSync } from './apis/loadModuleSync';
import { setModuleConfig } from './apis/setModuleConfig';

// Remote module loader uses singleton mode
const Apis = {
  preload,
  esModule,
  loadModule,
  loadModuleSync,
  setModuleConfig,
  hooks,
  loader,
  cacheModules,
};

export {
  preload,
  esModule,
  loadModule,
  loadModuleSync,
  setModuleConfig,
  hooks,
  loader,
  cacheModules,
  Apis as default,
};
