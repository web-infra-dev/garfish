import { lifecycle } from '../config';
import { interfaces } from '../interface';

export function GarfishOptionsLife(options) {
  return function (): interfaces.Plugin {
    const plugin = {
      name: 'default-life',
      version: __VERSION__,
    };
    lifecycle.forEach((life) => {
      if (options[life]) {
        plugin[life] = options[life];
      }
    });
    return plugin;
  };
}
