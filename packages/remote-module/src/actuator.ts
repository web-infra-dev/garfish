import { evalWithEnv } from '@garfish/utils';
import { ModuleManager } from '@garfish/loader';
import { hooks } from './hooks';
import { currentApp, moduleConfig } from './common';

export class Actuator {
  private manager: ModuleManager;
  public env: Record<string, any>;

  constructor(manager: ModuleManager, externals?: Record<string, any>) {
    this.manager = manager;
    this.env = {
      exports: {},
      module: null,
      require: (key) =>
        (externals || {})[key] ||
        moduleConfig.externals[key] ||
        currentApp?.context.externals[key],
    };
    this.env.module = this.env;
    hooks.lifecycle.initModule.emit(this);
  }

  execScript() {
    const { url, moduleCode } = this.manager;
    if (currentApp) {
      // Avoid conflict with Garfish cjs
      currentApp.execScript(moduleCode, this.env, url, { noEntry: true });
    } else {
      const sourceUrl = `\n${url ? `//# sourceURL=${url}\n` : ''}`;
      evalWithEnv(`;${moduleCode}\n${sourceUrl}`, this.env, window);
    }
    return this.env;
  }
}
