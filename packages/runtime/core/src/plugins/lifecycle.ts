import { interfaces } from '../interface';

export function GarfishOptionsLife(options, name: string) {
  return function (): interfaces.Plugin {
    return {
      name,
      version: __VERSION__,
      ...options,
    };
  };
}
