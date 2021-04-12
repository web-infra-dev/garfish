// import loadble from 'loadble';

import { AppInfo, LoadAppOptions } from '../type';

// Loader负责app的创建和资源的调度，用户管理资源和创建app，App最终交给 Garfish 来处理
export class loader {
  private forceCaches: Set<string>;
  private caches: Record<string, any>;
  private loadings: Record<string, Promise<any>>;

  constructor() {
    this.forceCaches = new Set();
    this.caches = Object.create(null);
    this.loadings = Object.create(null);
  }

  // TODO: 导如promise的app，
  loadApp(_appInfo: AppInfo, _opts: LoadAppOptions): Promise<void> {}
}
