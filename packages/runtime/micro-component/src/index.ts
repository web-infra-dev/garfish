import { loadComponent } from './loadComponent';

// Micro component loader uses singleton mode
const loader = {
  loadComponent,
};

export { loadComponent, loader as default };
