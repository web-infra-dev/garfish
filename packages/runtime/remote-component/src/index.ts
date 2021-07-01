import { remoteComponentPlugin } from './garfishPlugin';
import {
  preload,
  setExternal,
  loadComponent,
  loadComponentSync,
  cacheComponents,
} from './apis';

// Micro component loader uses singleton mode
const loader = {
  preload,
  setExternal,
  loadComponent,
  loadComponentSync,
  cacheComponents,
};

export {
  preload,
  setExternal,
  loadComponent,
  loadComponentSync,
  remoteComponentPlugin,
  cacheComponents,
  loader as default,
};
