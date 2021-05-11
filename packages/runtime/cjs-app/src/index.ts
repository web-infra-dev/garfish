import Garfish, { interfaces } from '@garfish/core';
import { assert, warn } from '@garfish/utils';
import { App } from './app';

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

  export namespace interfaces {
    export interface App {
      name: string;
      appInfo: AppInfo;
      entryResManager: interfaces.HtmlResource;
      cjsModules: Record<string, any>;
      customExports: Record<string, any>; // If you don't want to use the CJS export, can use this
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

export type CustomerLoader = (
  provider: interfaces.Provider,
  appInfo: interfaces.AppInfo,
  path: string,
) => Promise<interfaces.LoaderResult | void> | interfaces.LoaderResult | void;

interface Options {
  customLoader?: CustomerLoader;
}

export default function cjsApp(
  options: Options = { customLoader: () => null },
) {
  return function (Garfish: Garfish): interfaces.Plugin {
    Garfish.setExternal = setExternal;
    Garfish.externals = {};

    function setExternal(
      nameOrExtObj: string | Record<string, any>,
      value?: any,
    ) {
      assert(nameOrExtObj, 'Invalid parameter.');
      if (typeof nameOrExtObj === 'object') {
        for (const key in nameOrExtObj) {
          if (Garfish.externals[key]) {
            __DEV__ && warn(`The "${key}" will be overwritten in external.`);
          }
          Garfish.externals[key] = nameOrExtObj[key];
        }
      } else {
        Garfish.externals[nameOrExtObj] = value;
      }
    }

    return {
      name: 'cjs-app',
      version: __VERSION__,
      initializeApp(context, appInfo, resource, ResourceModules, isHtmlModule) {
        const instance = new App(
          context,
          appInfo,
          resource,
          ResourceModules,
          isHtmlModule,
          options.customLoader,
        );
        instance.cjsModules.require = (name) =>
          Garfish.externals && Garfish.externals[name];
        return Promise.resolve(instance);
      },
    };
  };
}
