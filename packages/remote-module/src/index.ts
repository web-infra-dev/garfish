import { cacheModules } from './common';
import { preload } from './apis/preload';
import { esModule } from './apis/esModule';
import { loadModule } from './apis/loadModule';
import { loadModuleSync } from './apis/loadModuleSync';
import { setModuleConfig } from './apis/setModuleConfig';

// Remote module loader uses singleton mode
const loader = {
  preload,
  esModule,
  loadModule,
  loadModuleSync,
  setModuleConfig,
  cacheModules,
};

export {
  preload,
  esModule,
  loadModule,
  loadModuleSync,
  setModuleConfig,
  cacheModules,
  loader as default,
};
