import { evalWithEnv } from '@garfish/utils';
import { ModuleManager } from '@garfish/loader';
import { externals, getCurrentApp } from './common';

export class Actuator {
  private manager: ModuleManager;
  public env: Record<string, any>;

  constructor(manager: ModuleManager, env?: Record<string, any>) {
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
    const { url, moduleCode } = this.manager;
    if (app) {
      // Avoid conflict with Garfish cjs
      app.execScript(moduleCode, this.env, url, { noEntry: true });
    } else {
      const sourceUrl = `\n${url ? `//# sourceURL=${url}\n` : ''}`;
      evalWithEnv(`;${moduleCode}\n${sourceUrl}`, this.env);
    }
    return this.env;
  }
}
