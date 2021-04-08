import { hooks } from './utils/hooks';
import { getDefaultOptions } from './config';
import { Options } from './type';

export class Garfish {
  public version = __VERSION__;
  private Hooks = hooks;
  public options = getDefaultOptions();

  run(_options?: Options) {
    console.log(this.Hooks);
  }
}
