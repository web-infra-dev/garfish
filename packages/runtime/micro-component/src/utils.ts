import { Loader } from '@garfish/loader';

export const loader = (() => {
  if (window.Garfish) {
    const loader = window.Garfish && window.Garfish.loader;
    if (loader && loader.personalId === Symbol.for('garfish.loader')) {
      return loader;
    }
    return new Loader();
  }
})();
