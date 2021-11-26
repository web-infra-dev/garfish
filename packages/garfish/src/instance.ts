import Garfish from '@garfish/core';
import { GarfishRouter } from '@garfish/router';
import { GarfishBrowserVm } from '@garfish/browser-vm';
import { GarfishBrowserSnapshot } from '@garfish/browser-snapshot';
import { def, warn, hasOwn, inBrowser, __GARFISH_FLAG__ } from '@garfish/utils';

declare global {
  interface Window {
    __GARFISH__: boolean;
  }
}

export const GarfishInstance = new Garfish({
  plugins: [GarfishRouter(), GarfishBrowserVm(), GarfishBrowserSnapshot()],
});

if (inBrowser()) {
  def(window, '__GARFISH__', true);
}
