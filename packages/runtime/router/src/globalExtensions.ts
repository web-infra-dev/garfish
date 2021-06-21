import { RouterInterface } from './context';

declare module '@garfish/core' {
  export interface Garfish {
    router: RouterInterface;
  }

  export namespace interfaces {
    export interface Garfish {
      router: RouterInterface;
    }

    export interface Config {
      autoRefreshApp?: boolean;
      onNotMatchRouter?: (path: string) => Promise<void> | void;
    }

    export interface AppInfo {
      activeWhen?: string | ((path: string) => boolean); // 手动加载，可不填写路由
      active?: (appInfo: AppInfo, rootPath: string) => void;
      deactive?: (appInfo: AppInfo, rootPath: string) => void;
      basename?: string;
    }
  }
}
