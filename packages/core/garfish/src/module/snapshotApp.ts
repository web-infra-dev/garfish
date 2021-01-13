import { SnapshotSandbox } from '@garfish/sandbox';
import { Garfish } from '../garfish';
import { App, ResourceModules } from './app';
import { JsResource, HtmlResource } from './loader';
import { AppInfo, LoadAppOptions } from '../config';

export class SnapshotApp extends App {
  public sandboxType = 'snapshot';
  public sandbox: SnapshotSandbox;
  public openSandBox: boolean = true;

  constructor(
    context: Garfish,
    appInfo: AppInfo,
    opts: LoadAppOptions,
    entryResManager: HtmlResource | JsResource,
    resources?: ResourceModules,
  ) {
    super(context, appInfo, opts, entryResManager, resources);

    this.openSandBox = opts.sandbox.open;
    this.sandbox = new SnapshotSandbox(
      this.appInfo.name,
      this.context.options.protectVariable || [],
    );
  }

  execScript(code: string, url: string) {
    const fn = `${code}\n//# sourceURL=${url || ''}`;
    new Function('module', 'exports', 'require', fn).call(
      null,
      this.cjsModules,
      this.cjsModules.exports,
      (name: string) => this.context.externals[name],
    );
  }

  sandBoxActive(isInit?: boolean) {
    if (!this.openSandBox) return;
    this.sandbox.activate(isInit);
  }

  sandBoxDeactivate() {
    if (!this.openSandBox) return;
    this.sandbox.deactivate();
  }
}
