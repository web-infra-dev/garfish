import Garfish, { interfaces } from '@garfish/core';
declare module '@garfish/core' {
  export default interface Garfish {
    setExternal: (
      nameOrExtObj: string | Record<string, any>,
      value?: any,
    ) => void;
    externals: Record<string, any>;
    loadApp(
      name: string,
      opts: interfaces.LoadAppOptions,
    ): Promise<interfaces.App>;
  }
  namespace interfaces {
    interface App {
      name: string;
      appInfo: AppInfo;
      cjsModules: Record<string, any>;
      customExports: Record<string, any>;
      mounted: boolean;
      appContainer: HTMLElement;
      provider: Provider;
      htmlNode: HTMLElement | ShadowRoot;
      isHtmlMode: boolean;
      strictIsolation: boolean;
      mount(): Promise<boolean>;
      unmount(): boolean;
      getExecScriptEnv(noEntry: boolean): Record<string, any>;
      execScript(
        code: string,
        env: Record<string, any>,
        url?: string,
        options?: {
          async?: boolean;
          noEntry?: boolean;
        },
      ): void;
    }
  }
}
