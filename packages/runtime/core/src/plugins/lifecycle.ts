import { lifecycle } from '../config';
import { interfaces } from '../interface';

export function GarfishOptionsLife() {
  return function (Garfish: interfaces.Garfish): interfaces.Plugin {
    const plugin = {
      name: 'default-life',
      version: __VERSION__,
    };
    lifecycle.forEach((life) => {
      if (Garfish.options[life]) {
        plugin[life] = Garfish.options[life];
      }
    });
    return plugin;
  };
}
