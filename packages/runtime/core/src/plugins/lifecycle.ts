import { interfaces } from '../interface';

export function GarfishOptionsLife(options) {
  return function (): interfaces.Plugin {
    return {
      name: 'default-life',
      version: __VERSION__,
      ...options,
    };
  };
}
