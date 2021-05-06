import Garfish from './dist/core.esm-browser.js';

declare global {
  interface Window {
    Garfish: Garfish;
  }
}
