import { preload, setExternal, loadComponent, loadComponentSync } from './apis';

// Micro component loader uses singleton mode
const loader = {
  preload,
  setExternal,
  loadComponent,
  loadComponentSync,
};

export {
  preload,
  setExternal,
  loadComponent,
  loadComponentSync,
  loader as default,
};
