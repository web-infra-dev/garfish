import Garfish from '@garfish/core';
import { GarfishBrowserVm } from '@garfish/browser-vm';
import { GarfishRouter } from '@garfish/router';
import {
  getParameterByName,
  warn,
  __GARFISH_FLAG__,
  def,
} from '@garfish/utils';

const DEBUG_GARFISH_TAG = '__GARFISH_INSTANCE_DEBUG__';

export const GarfishInstance = new Garfish({
  plugins: [GarfishBrowserVm(), GarfishRouter()],
});

try {
  const GarfishInstanceName =
    localStorage.getItem(DEBUG_GARFISH_TAG) ||
    getParameterByName(DEBUG_GARFISH_TAG);
  if (GarfishInstanceName) {
    let uniqueIndex = 0;
    let uniqueName = GarfishInstanceName + uniqueIndex;
    while (window[uniqueName]) {
      uniqueIndex++;
      uniqueName = GarfishInstanceName + uniqueIndex;
    }
    def(window, uniqueName, GarfishInstance);

    warn(
      `The current in the garfish debug mode, garfish instance name is "${uniqueName}"`,
    );
  }
} catch (err) {
  warn(err);
}
