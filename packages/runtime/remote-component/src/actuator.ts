import { evalWithEnv } from '@garfish/utils';
import { ComponentManager } from '@garfish/loader';

export const EXTERNALS = Object.create(null);

export class Actuator {
  private manager: ComponentManager;
  private env: Record<string, any>;

  constructor(manager: ComponentManager, env?: Record<string, any>) {
    this.manager = manager;
    // Default use cjs module
    this.env = {
      ...env,
      exports: {},
      module: null,
      // Env has a higher priority
      require: (key) => this.env[key] || EXTERNALS[key],
    };
    this.env.module = this.env;
  }

  execScript() {
    const { url, componentCode } = this.manager;
    const sourceUrl = url ? `//# sourceURL=${url}\n` : '';
    evalWithEnv(`;${componentCode}\n${sourceUrl}`, this.env);
    return this.env;
  }
}
