import { lifecycle } from '../config';
import { interfaces } from '../interface';

export default function OptionsLife() {
  return function (Garfish: interfaces.Garfish): interfaces.Plugin {
    const plugin = {
      name: 'fix-hmr',
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
