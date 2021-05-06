import Garfish, { interfaces } from '@garfish/core';
import { assert, warn } from '@garfish/utils';

export default function Router(_Garfish: Garfish): interfaces.Plugin {
  return {
    name: 'router',
  };
}
