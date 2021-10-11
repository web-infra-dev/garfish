import { preload } from './apis/preload';
import { esModule } from './apis/esModule';
import { loadModule } from './apis/loadModule';
import { loadModuleSync } from './apis/loadModuleSync';
import { setModuleConfig } from './apis/setModuleConfig';
import { loader, cacheModules } from './common';

// Remote module loader uses singleton mode
const Apis = {
  preload,
  esModule,
  loadModule,
  loadModuleSync,
  setModuleConfig,
  loader,
  cacheModules,
};

export {
  preload,
  esModule,
  loadModule,
  loadModuleSync,
  setModuleConfig,
  loader,
  cacheModules,
  Apis as default,
};
