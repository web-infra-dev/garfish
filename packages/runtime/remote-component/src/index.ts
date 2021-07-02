import { preload } from './apis/preload';
import { toEsModule } from './apis/toEsModule';
import { setExternal } from './apis/setExternal';
import { loadComponent } from './apis/loadComponent';
import { loadComponentSync } from './apis/loadComponentSync';
import { cacheComponents } from './common';
import { remoteComponentPlugin } from './garfishPlugin';

// Micro component loader uses singleton mode
const loader = {
  preload,
  toEsModule,
  setExternal,
  loadComponent,
  loadComponentSync,
  cacheComponents,
};

export {
  preload,
  toEsModule,
  setExternal,
  loadComponent,
  loadComponentSync,
  remoteComponentPlugin,
  cacheComponents,
  loader as default,
};
