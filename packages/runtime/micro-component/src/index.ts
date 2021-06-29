import {
  setExternal,
  preloadComponent,
  loadComponent,
  loadComponentSync,
} from './apis';

// Micro component loader uses singleton mode
const loader = {
  setExternal,
  preloadComponent,
  loadComponent,
  loadComponentSync,
};

export {
  setExternal,
  loadComponent,
  loadComponentSync,
  preloadComponent,
  loader as default,
};
