import { SnapshotSandbox } from '@garfish/sandbox';
import { evalWithEnv, emitSandboxHook } from '@garfish/utils';
import { Garfish } from '../garfish';
import { HtmlResource } from './loader';
import { App, ResourceModules } from './app';
import { AppInfo, LoadAppOptions } from '../config';

export class SnapshotApp extends App {
  public openSandbox = true;
  public sandboxType = 'snapshot';
  public sandbox: SnapshotSandbox;

  constructor(
    context: Garfish,
    appInfo: AppInfo,
    opts: LoadAppOptions,
    entryResManager: HtmlResource,
    resources: ResourceModules,
    isHtmlMode: boolean,
  ) {
    super(context, appInfo, opts, entryResManager, resources, isHtmlMode, true);

    this.openSandbox =
      typeof opts.sandbox.open !== undefined ? opts.sandbox.open : true;
    this.sandbox = new SnapshotSandbox(
      this.appInfo.name,
      this.context.options.protectVariable || [],
    );
  }

  execScript(code: string, url = '') {
    const hooks = this.options.sandbox.hooks;
    const refs = { url, code, app: this };
    const args = [this.sandbox, refs];
    const params = {
      window,
      module: this.cjsModules,
      exports: this.cjsModules.exports,
      require: (name: string) => this.context.externals[name],
    };

    emitSandboxHook(hooks, 'onInvokeBefore', args);
    evalWithEnv(refs.code, refs.url, params);
    emitSandboxHook(hooks, 'onInvokeAfter', args);
  }

  sandBoxActive(isInit?: boolean) {
    if (!this.openSandbox) return;
    this.sandbox.activate(isInit);
  }

  sandBoxDeactivate(isCompile?: boolean) {
    if (!this.openSandbox) return;
    this.sandbox.deactivate(!isCompile);
  }
}
