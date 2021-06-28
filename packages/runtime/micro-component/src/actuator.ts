import { evalWithEnv } from '@garfish/utils';
import { ComponentManager } from '@garfish/loader';

export class Actuator {
  private manager: ComponentManager;
  // Default use cjs module
  private cjsModules: Record<string, any>;

  constructor(manager: ComponentManager) {
    this.manager = manager;
    this.cjsModules = {
      exports: {},
      module: this.cjsModules,
    };
  }

  execScript() {
    const env = this.cjsModules;
    const { url, componentCode } = this.manager;
    const sourceUrl = url ? `//# sourceURL=${url}\n` : '';
    evalWithEnv(`;${componentCode}\n${sourceUrl}`, env);
    return this.cjsModules;
  }
}
