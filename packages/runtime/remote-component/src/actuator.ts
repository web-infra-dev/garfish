import { evalWithEnv } from '@garfish/utils';
import { ComponentManager } from '@garfish/loader';
import { externals, getCurrentApp } from './common';

export class Actuator {
  private manager: ComponentManager;
  private env: Record<string, any>;

  constructor(manager: ComponentManager, env?: Record<string, any>) {
    this.manager = manager;
    this.env = {
      exports: {},
      module: null,
      require: (key) => (env || {})[key] || externals[key],
    };
    this.env.module = this.env;
  }

  execScript() {
    const app = getCurrentApp();
    const { url, componentCode } = this.manager;
    if (app) {
      // Avoid conflict with Garfish cjs
      app.execScript(componentCode, this.env, url, { noEntry: true });
    } else {
      const sourceUrl = `\n${url ? `//# sourceURL=${url}\n` : ''}`;
      evalWithEnv(`;${componentCode}\n${sourceUrl}`, this.env);
    }
    return this.env;
  }
}
