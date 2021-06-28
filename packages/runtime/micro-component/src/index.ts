import {
  preloadComponent,
  loadComponent,
  loadComponentSync,
} from './loadComponent';

// Micro component loader uses singleton mode
const loader = {
  loadComponent,
  loadComponentSync,
  preloadComponent,
};

export {
  loadComponent,
  loadComponentSync,
  preloadComponent,
  loader as default,
};
