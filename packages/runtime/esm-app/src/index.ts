import Garfish, { interfaces } from '@garfish/core';
import { assert, warn } from '@garfish/utils';

export default function esmApp(_Garfish: Garfish): interfaces.Plugin {
  return {
    name: 'esm-app',
    version: __VERSION__,
  };
}
